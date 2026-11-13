#!/usr/bin/env node

// Gate de formatacao incremental no padrao do lint-ratchet.mjs: congela a
// divida de formatacao de HOJE em um baseline e falha so se um arquivo NOVO
// (nao registrado no baseline) aparecer fora do padrao do Prettier.
//
// O `format:check` direto (prettier --check .) era um gate tudo-ou-nada que
// nunca passou: 1554 arquivos do repo nasceram fora do padrao. Removido do CI
// na PR #99. Este ratchet devolve o gate de formato ao CI SEM exigir formatar
// 100% do repo de uma vez: a divida existente fica congelada e crescer so
// para arquivos que ja estao no baseline; qualquer arquivo novo fora do
// padrao falha o CI.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const SCHEMA_VERSION = 1;
const DEFAULT_BASELINE = "scripts/ci/prettier-baseline.json";
const COMMAND = "prettier --list-different --ignore-unknown .";
const MAX_REPORTED_FILES = 50;

function normalizeEol(value) {
  return String(value ?? "").replace(/\r\n?/gu, "\n");
}

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/gu, " ")
    .trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function readJson(filePath, description) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    throw new Error(`Nao foi possivel ler ${description} em ${filePath}.`);
  }
}

// O Prettier resolve os paths relativos ao cwd com forward slash em qualquer
// SO (inclusive Windows), entao nao ha normalizacao de separador a fazer -
// so tiramos um "./" inicial se o runner o adicionar.
function normalizeRelativePath(relativePath) {
  const normalized = relativePath.replace(/\\/gu, "/");
  return normalized.startsWith("./") ? normalized.slice(2) : normalized;
}

function prettierVersion(root) {
  const packagePath = path.join(root, "node_modules", "prettier", "package.json");
  if (!existsSync(packagePath)) return null;
  try {
    return JSON.parse(readFileSync(packagePath, "utf8")).version ?? null;
  } catch {
    return null;
  }
}

function fileSha256(filePath) {
  return existsSync(filePath) ? sha256(normalizeEol(readFileSync(filePath, "utf8"))) : null;
}

// Configuracoes consideradas: .prettierrc (principal) e .prettierignore. Se
// outra fonte (package.json "prettier", .prettierrc.js/yaml/toml/json) for
// usada no futuro, adicionar ao set abaixo.
function configSha256(root) {
  const candidates = [
    path.join(root, ".prettierrc"),
    path.join(root, ".prettierrc.json"),
    path.join(root, ".prettierrc.js"),
    path.join(root, ".prettierrc.cjs"),
    path.join(root, ".prettierrc.yaml"),
    path.join(root, ".prettierrc.yml"),
    path.join(root, ".prettierignore"),
  ];
  return sha256(candidates.map((file) => fileSha256(file) ?? "").join("|"));
}

// Roda o Prettier e devolve a lista de arquivos fora do padrao (relativo ao
// root, forward slash). O exit 1 do --list-different e o resultado esperado
// quando ha arquivos diferentes - nao e falha de CLI. Qualquer outro exit
// (ex.: config invalida, parser quebrado) e falha real e bloqueia o gate.
function runPrettier(root) {
  const prettierEntry = path.join(root, "node_modules", "prettier", "bin", "prettier.cjs");
  if (!existsSync(prettierEntry)) {
    throw new Error(
      "Prettier local nao encontrado. Execute a instalacao das dependencias primeiro."
    );
  }

  const result = spawnSync(
    process.execPath,
    [prettierEntry, "--list-different", "--ignore-unknown", "."],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );

  if (result.error) throw result.error;
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(
      `Prettier falhou com exit ${result.status}: ${normalizeWhitespace(result.stderr ?? "")}`
    );
  }

  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  return normalizeEol(output)
    .split("\n")
    .map((file) => file.trim())
    .filter((file) => file.length > 0 && !file.startsWith("["))
    .map((file) => normalizeRelativePath(file, root))
    .sort((a, b) => a.localeCompare(b));
}

function parseArguments(argv) {
  const options = { baseline: DEFAULT_BASELINE, root: process.cwd(), updateBaseline: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--update-baseline") {
      options.updateBaseline = true;
    } else if (argument === "--baseline" || argument === "--root") {
      const value = argv[index + 1];
      if (!value) throw new Error(`Valor ausente para ${argument}.`);
      options[argument.slice(2)] = value;
      index += 1;
    } else if (argument === "--help") {
      options.help = true;
    } else {
      throw new Error(`Argumento desconhecido: ${argument}`);
    }
  }

  options.root = path.resolve(options.root);
  options.baseline = path.resolve(options.root, options.baseline);
  return options;
}

function validateBaseline(baseline) {
  if (
    !baseline ||
    baseline.schemaVersion !== SCHEMA_VERSION ||
    baseline.command !== COMMAND ||
    !(typeof baseline.prettierVersion === "string" || baseline.prettierVersion === null) ||
    !(typeof baseline.configSha256 === "string" || baseline.configSha256 === null) ||
    !Array.isArray(baseline.files)
  ) {
    throw new Error(
      `Baseline de formatacao invalido ou com schema diferente de ${SCHEMA_VERSION}.`
    );
  }
}

export function createBaseline(unformattedFiles, root = process.cwd()) {
  const normalized = unformattedFiles.map((file) => normalizeRelativePath(file, root));
  return {
    schemaVersion: SCHEMA_VERSION,
    command: COMMAND,
    prettierVersion: prettierVersion(root),
    configSha256: configSha256(root),
    files: [...new Set(normalized)].sort((a, b) => a.localeCompare(b)),
  };
}

export function compareBaseline(baseline, unformattedFiles, root = process.cwd()) {
  validateBaseline(baseline);
  const current = createBaseline(unformattedFiles, root);
  if (
    baseline.prettierVersion !== current.prettierVersion ||
    baseline.configSha256 !== current.configSha256
  ) {
    throw new Error(
      "O Prettier ou a config de formatacao mudou desde a geracao do baseline. " +
        "Revise a mudanca e regenere o baseline."
    );
  }

  const baselineSet = new Set(baseline.files);
  const currentSet = new Set(current.files);
  const added = [...currentSet]
    .filter((file) => !baselineSet.has(file))
    .sort((a, b) => a.localeCompare(b));
  const removed = [...baselineSet]
    .filter((file) => !currentSet.has(file))
    .sort((a, b) => a.localeCompare(b));

  return {
    baselineCount: baselineSet.size,
    currentCount: currentSet.size,
    added,
    removed,
  };
}

export function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArguments(argv);
    if (options.help) {
      console.log(`Uso:
  node scripts/ci/format-ratchet.mjs
  node scripts/ci/format-ratchet.mjs --update-baseline

Opcoes de teste: --baseline <arquivo> --root <diretorio>`);
      return 0;
    }

    const unformatted = runPrettier(options.root);

    if (options.updateBaseline) {
      const baseline = createBaseline(unformatted, options.root);
      writeFileSync(options.baseline, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
      console.log(
        `Baseline de formatacao atualizado: ${baseline.files.length} arquivos fora do padrao em ${options.baseline}`
      );
      return 0;
    }

    const baseline = readJson(options.baseline, "baseline de formatacao");
    const comparison = compareBaseline(baseline, unformatted, options.root);
    console.log(
      `Format ratchet: baseline=${comparison.baselineCount}, atual=${comparison.currentCount}, ` +
        `removidos=${comparison.removed.length}, novos=${comparison.added.length}`
    );

    if (comparison.removed.length > 0) {
      console.log(
        `OK: ${comparison.removed.length} arquivo(s) sairam do baseline (formatados agora) -` +
          " divida paga. Baixe o baseline (`node scripts/ci/format-ratchet.mjs --update-baseline`) para refletir o codigo."
      );
    }

    if (comparison.added.length === 0) {
      console.log("OK: nenhum arquivo novo fora do padrao de formatacao.");
      return 0;
    }

    console.error("FALHA: arquivos novos fora do padrao de formatacao:");
    for (const file of comparison.added.slice(0, MAX_REPORTED_FILES)) {
      console.error(`  ${file}`);
    }
    if (comparison.added.length > MAX_REPORTED_FILES) {
      console.error(`  ... e mais ${comparison.added.length - MAX_REPORTED_FILES} arquivos.`);
    }
    console.error(
      "Formate os arquivos novos (`npx prettier --write <arquivo>`) ou atualize o baseline somente " +
        "com aprovacao explicita."
    );
    return 1;
  } catch (error) {
    console.error(`ERRO no format ratchet: ${error.message}`);
    return 2;
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = main();
}
