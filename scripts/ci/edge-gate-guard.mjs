#!/usr/bin/env node

// Gate de credencial nas edge functions.
//
// Por que existe: a chave publicavel do app (`sb_publishable_...`) vai no bundle
// publico do front e o gateway a aceita como JWT (`verify_jwt = true`). A unica
// protecao real de uma edge function e o gate no proprio codigo. Em 24/11/2026
// esse mesmo buraco voltou em tres ondas: 38 funcoes legadas (#300 e #301), 3
// funcoes orfas e 1 funcao sem checagem nenhuma (#302).
//
// O que este guard verifica, sem heuristica de "parece autenticado":
//   1. toda pasta de funcao (com index.ts) esta declarada em supabase/config.toml;
//   2. toda entrada do config.toml tem pasta correspondente (entrada orfa falha);
//   3. a entrada declara verify_jwt explicitamente;
//   4. o index.ts tem um gate reconhecido (helper de _shared, JWT conferido na
//      Auth API, papel via has_role/has_permission, segredo de cron ou chave de
//      agente validada em agent_keys).
//
// Excecoes (funcao publica por desenho) ficam em scripts/ci/edge-gate-baseline.json,
// uma a uma e com motivo escrito. Funcao nova sem gate nao passa sem aprovacao
// explicita: node scripts/ci/edge-gate-guard.mjs --update-baseline

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SCHEMA_VERSION = 1;
const DEFAULT_BASELINE = "scripts/ci/edge-gate-baseline.json";
const FUNCTIONS_DIR = "supabase/functions";
const CONFIG_FILE = "supabase/config.toml";
const MAX_REPORTED = 50;
const PENDING_REASON = "PENDENTE";

// Cada indicador e um gate que prova a credencial do chamador. A presenca de
// header (`if (!authHeader) ... 401`) nao esta na lista de proposito: foi
// exatamente essa checagem que deixou get-employee-timeline e
// send-email-notification abertas ate a #302.
export const GATE_INDICATORS = [
  { id: "requireServiceRole", pattern: /requireServiceRole\s*\(/u },
  { id: "requireUserOrServiceRole", pattern: /requireUserOrServiceRole\s*\(/u },
  { id: "requireCronOrServiceRole", pattern: /requireCronOrServiceRole\s*\(/u },
  { id: "verifyAuth", pattern: /verifyAuth\s*\(/u },
  { id: "auth.getUser", pattern: /\.auth\.getUser\s*\(/u },
  { id: "auth/v1/user", pattern: /\/auth\/v1\/user/u },
  { id: "has_role", pattern: /has_role\b/u },
  { id: "has_permission", pattern: /has_permission\b/u },
  { id: "cron-secret", pattern: /cron_secrets|x-cron-secret/u },
  { id: "agent_keys", pattern: /agent_keys/u },
];

export function detectGate(source) {
  const text = String(source ?? "");
  return GATE_INDICATORS.filter((indicator) => indicator.pattern.test(text)).map(
    (indicator) => indicator.id
  );
}

export function parseConfigFunctions(tomlText) {
  const entries = [];
  let current = null;
  let keys = new Set();
  for (const rawLine of String(tomlText ?? "").split("\n")) {
    const line = rawLine.trim();
    const header = /^\[functions\.([A-Za-z0-9_-]+)\]$/u.exec(line);
    if (header) {
      current = { name: header[1], hasVerifyJwt: false, duplicateKeys: [] };
      entries.push(current);
      keys = new Set();
      continue;
    }
    if (line.startsWith("[")) {
      current = null;
      keys = new Set();
      continue;
    }
    const key = /^([A-Za-z0-9_-]+)\s*=/u.exec(line);
    if (!key || !current) continue;
    // TOML nao aceita chave repetida na mesma tabela: o CLI do Supabase aborta
    // com "trying to redefine an already defined table or value" antes de
    // tocar o banco, e o deploy fica vermelho sem nenhum job ter avisado.
    if (keys.has(key[1]) && !current.duplicateKeys.includes(key[1])) {
      current.duplicateKeys.push(key[1]);
    }
    keys.add(key[1]);
    if (key[1] === "verify_jwt") current.hasVerifyJwt = true;
  }
  return entries;
}

export function collectFunctions(root) {
  const dir = path.join(root, FUNCTIONS_DIR);
  if (!existsSync(dir)) throw new Error(`Diretorio nao encontrado: ${dir}`);
  const functions = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const indexFile = path.join(dir, entry.name, "index.ts");
    // _shared (e qualquer pasta sem index.ts) nao e uma funcao publicada.
    if (!existsSync(indexFile)) continue;
    functions.push({ name: entry.name, source: readFileSync(indexFile, "utf8") });
  }
  return functions;
}

export function analyze({ functions, configText, baseline }) {
  const declared = parseConfigFunctions(configText);
  const declaredNames = new Set(declared.map((entry) => entry.name));
  const exceptionList = Array.isArray(baseline?.exceptions) ? baseline.exceptions : [];
  const exceptions = new Map(
    exceptionList.map((entry) => [String(entry.function ?? ""), String(entry.reason ?? "")])
  );
  const sorted = [...functions].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const sourceByName = new Map(sorted.map((fn) => [fn.name, fn.source]));

  const result = {
    totalFunctions: sorted.length,
    totalDeclared: declared.length,
    missingConfig: [],
    orphanConfig: [],
    noVerifyJwt: [],
    ungated: [],
    suppressed: [],
    paid: [],
    pendingReason: [],
    tomlRedefinitions: [],
  };

  for (const fn of sorted) {
    if (!declaredNames.has(fn.name)) result.missingConfig.push(fn.name);
    if (detectGate(fn.source).length > 0) continue;
    if (!exceptions.has(fn.name)) {
      result.ungated.push(fn.name);
      continue;
    }
    result.suppressed.push(fn.name);
    const reason = exceptions.get(fn.name).trim();
    if (reason === "" || reason.startsWith(PENDING_REASON)) result.pendingReason.push(fn.name);
  }

  const declaredTables = new Set();
  for (const entry of declared) {
    if (declaredTables.has(entry.name)) {
      result.tomlRedefinitions.push(`[functions.${entry.name}]`);
    }
    declaredTables.add(entry.name);
    for (const duplicated of entry.duplicateKeys) {
      result.tomlRedefinitions.push(`${entry.name}.${duplicated}`);
    }
    if (!sourceByName.has(entry.name)) result.orphanConfig.push(entry.name);
    if (!entry.hasVerifyJwt) result.noVerifyJwt.push(entry.name);
  }

  for (const name of exceptions.keys()) {
    const source = sourceByName.get(name);
    if (source === undefined || detectGate(source).length > 0) result.paid.push(name);
  }

  return result;
}

function parseArguments(argv) {
  const options = {
    updateBaseline: false,
    help: false,
    root: process.cwd(),
    baseline: DEFAULT_BASELINE,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--update-baseline") options.updateBaseline = true;
    else if (argument === "--root" || argument === "--baseline") {
      const value = argv[index + 1];
      if (!value) throw new Error(`Valor ausente para ${argument}.`);
      options[argument.slice(2)] = value;
      index += 1;
    } else if (argument === "--help") options.help = true;
    else throw new Error(`Argumento desconhecido: ${argument}`);
  }
  options.root = path.resolve(options.root);
  options.baseline = path.resolve(options.root, options.baseline);
  return options;
}

function readJson(filePath, description) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Nao foi possivel ler ${description} em ${filePath}: ${error.message}`);
  }
}

function printList(title, names) {
  console.error(title);
  for (const name of names.slice(0, MAX_REPORTED)) console.error(`  - ${name}`);
  if (names.length > MAX_REPORTED) console.error(`  ... e mais ${names.length - MAX_REPORTED}.`);
}

export function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArguments(argv);
    if (options.help) {
      console.log(`Uso:
  node scripts/ci/edge-gate-guard.mjs
  node scripts/ci/edge-gate-guard.mjs --update-baseline

Opcoes de teste: --baseline <arquivo> --root <diretorio>`);
      return 0;
    }

    const configPath = path.join(options.root, CONFIG_FILE);
    if (!existsSync(configPath)) throw new Error(`Arquivo nao encontrado: ${configPath}`);
    const functions = collectFunctions(options.root);
    const configText = readFileSync(configPath, "utf8");

    if (options.updateBaseline) {
      const previous = existsSync(options.baseline)
        ? readJson(options.baseline, "baseline do edge gate guard")
        : { exceptions: [] };
      const previousReasons = new Map(
        (Array.isArray(previous.exceptions) ? previous.exceptions : []).map((entry) => [
          String(entry.function ?? ""),
          String(entry.reason ?? ""),
        ])
      );
      const current = analyze({ functions, configText, baseline: { exceptions: [] } });
      const exceptions = current.ungated.map((name) => ({
        function: name,
        reason: previousReasons.get(name) ?? `${PENDING_REASON}: justifique esta excecao no PR`,
      }));
      const baseline = {
        schemaVersion: SCHEMA_VERSION,
        updatedAt: new Date().toISOString().slice(0, 10),
        exceptions,
      };
      writeFileSync(options.baseline, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
      console.log(
        `Baseline do edge gate guard atualizado: ${exceptions.length} excecoes em ${options.baseline}`
      );
      return 0;
    }

    const baseline = readJson(options.baseline, "baseline do edge gate guard");
    const result = analyze({ functions, configText, baseline });
    const withGate = result.totalFunctions - result.ungated.length - result.suppressed.length;
    console.log(
      `Edge gate guard: funcoes=${result.totalFunctions}, declaradas=${result.totalDeclared}, ` +
        `com gate=${withGate}, excecoes=${result.suppressed.length}, ` +
        `novas=${result.ungated.length + result.missingConfig.length + result.orphanConfig.length + result.noVerifyJwt.length + result.pendingReason.length + result.tomlRedefinitions.length}`
    );

    if (result.paid.length > 0) {
      console.log(
        `Excecoes pagas (fora do baseline): ${result.paid.join(", ")} - rode --update-baseline.`
      );
    }

    const failures =
      result.ungated.length +
      result.missingConfig.length +
      result.orphanConfig.length +
      result.noVerifyJwt.length +
      result.pendingReason.length +
      result.tomlRedefinitions.length;
    if (failures === 0) {
      console.log(
        "OK: toda edge function tem gate de credencial e entrada explicita no config.toml."
      );
      return 0;
    }

    if (result.ungated.length > 0) {
      printList(
        "FALHA: edge function publicada sem gate de credencial reconhecido (index.ts):",
        result.ungated
      );
      console.error(
        "  Use requireServiceRole/requireUserOrServiceRole/requireCronOrServiceRole de _shared/auth.ts,"
      );
      console.error(
        "  verifique o JWT na Auth API ou exija papel/segredo. Excecao exige motivo no baseline."
      );
    }
    if (result.missingConfig.length > 0) {
      printList(
        "FALHA: pasta de funcao sem entrada em supabase/config.toml:",
        result.missingConfig
      );
    }
    if (result.orphanConfig.length > 0) {
      printList(
        "FALHA: entrada em supabase/config.toml sem pasta correspondente:",
        result.orphanConfig
      );
    }
    if (result.noVerifyJwt.length > 0) {
      printList("FALHA: entrada de funcao sem verify_jwt explicito:", result.noVerifyJwt);
    }
    if (result.pendingReason.length > 0) {
      printList("FALHA: excecao sem motivo escrito no baseline:", result.pendingReason);
    }
    if (result.tomlRedefinitions.length > 0) {
      printList(
        "FALHA: supabase/config.toml redefine tabela ou chave (o CLI do Supabase rejeita o arquivo):",
        result.tomlRedefinitions
      );
      console.error("  O deploy aborta em `supabase db push` e `supabase functions deploy` com");
      console.error(
        "  'trying to redefine an already defined table or value' antes de tocar o banco."
      );
    }
    return 1;
  } catch (error) {
    console.error(`ERRO no edge gate guard: ${error.message}`);
    return 2;
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = main();
}
