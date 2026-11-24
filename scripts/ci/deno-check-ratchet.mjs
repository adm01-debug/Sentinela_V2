#!/usr/bin/env node

// `deno check` nas edge functions de supabase/functions.
//
// Por que existe: o job "deno-contract-tests" da CI roda so `deno test`, que
// passa com dezenas de erros de tipo no codigo das edges. Foi por esse buraco
// que dois bugs reais chegaram na main (rate limit lendo um campo inexistente
// em _shared/rateLimiting.ts e destructuring sem default em send-webhook).
// Este ratchet segue o mesmo principio do typecheck-ratchet.mjs e do
// lint-ratchet.mjs: compara as ocorrencias com um baseline e falha SO quando
// uma NOVA ocorrencia aparece. A divida de hoje fica congelada, nao cresce.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const SCHEMA_VERSION = 1;
const DEFAULT_BASELINE = "scripts/ci/deno-check-baseline.json";
const FUNCTIONS_DIR = "supabase/functions";
const COMMAND = `deno check ${FUNCTIONS_DIR}/*/index.ts`;
const MAX_REPORTED_ISSUES = 50;
const MAX_OUTPUT_SNIPPET = 500;
// A cauda e onde o deno escreve o motivo real de uma falha de CLI (download
// recusado, lock divergente, flag invalida). Mostrar so a cabeca escondia isso.
const MAX_OUTPUT_TAIL_LINES = 30;
// Registry fora do ar nao e divida de tipo: uma tentativa extra evita vermelho
// falso por 429/queda momentanea. Se a segunda tambem falhar, quebra (fail-closed).
const MAX_ATTEMPTS = 2;

// O deno escreve com cor mesmo quando a saida vai para um pipe/arquivo; sem
// limpar os escapes o parser nao ve o inicio das linhas. Construido com
// String.fromCharCode para nao embutir caractere de controle no fonte.
const ANSI_ESCAPE = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "gu");

function stripAnsi(value) {
  return String(value ?? "").replace(ANSI_ESCAPE, "");
}

function normalizeEol(value) {
  return stripAnsi(value).replace(/\r\n?/gu, "\n");
}

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/gu, " ")
    .trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

// Mesmo racional do typecheck-ratchet.mjs: le e cacheia as linhas de cada
// arquivo para calcular o "contexto" (linha anterior + linha + proxima linha
// nao-vazias) de cada diagnostico, o que desambigua ocorrencias identicas
// (mesmo arquivo, mesmo codigo, mesma mensagem) sem depender da posicao.
function createSourceLineReader(root) {
  const absoluteRoot = path.resolve(root);
  const cache = new Map();
  return function readLines(file) {
    const absolute = path.resolve(root, file);
    if (cache.has(absolute)) return cache.get(absolute);

    const relative = path.relative(absoluteRoot, absolute);
    const insideRoot =
      relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");

    let lines = null;
    if (insideRoot && existsSync(absolute)) {
      try {
        lines = normalizeEol(readFileSync(absolute, "utf8")).split("\n");
      } catch {
        lines = null;
      }
    }
    cache.set(absolute, lines);
    return lines;
  };
}

function contextHashForLine(readLines, file, line) {
  const lines = readLines(file);
  if (!lines) return null;
  const lineIndex = line - 1;
  if (lineIndex < 0 || lineIndex >= lines.length) return null;

  const current = normalizeWhitespace(lines[lineIndex]);
  let previous = "";
  for (let index = lineIndex - 1; index >= 0 && !previous; index -= 1) {
    previous = normalizeWhitespace(lines[index]);
  }
  let next = "";
  for (let index = lineIndex + 1; index < lines.length && !next; index += 1) {
    next = normalizeWhitespace(lines[index]);
  }
  if (!previous && !current && !next) return null;

  return sha256([previous, current, next].join("\n"));
}

// Os diagnosticos vem de arquivos sob supabase/functions, mas o caminho
// depende de onde o comando rodou (runner da CI, /mnt/c/..., maquina local).
// Ancorar no marcador "/supabase/functions/" deixa o baseline portavel.
function normalizeFilePath(rawPath, root) {
  let value = String(rawPath ?? "").trim();
  if (value.startsWith("file://")) {
    const encoded = value.slice("file://".length);
    try {
      value = decodeURIComponent(encoded);
    } catch {
      value = encoded;
    }
  }
  if (value.includes("://")) return value;

  const marker = `/${FUNCTIONS_DIR}/`;
  const index = value.indexOf(marker);
  if (index >= 0) return value.slice(index + 1);
  if (value.startsWith(`${FUNCTIONS_DIR}/`)) return value;

  const relative = path.relative(path.resolve(root), path.resolve(value));
  return (relative || ".").split(path.sep).join("/");
}

// Saida do deno check:
//   TS18046 [ERROR]: 'err' is of type 'unknown'.
//     return new Response(...);
//     ~~~
//       at file:///caminho/index.ts:29:49
// Snippet e continuacao de mensagem ("Types of property ... are incompatible")
// ficam entre o cabecalho e a ancora. A chave usa SO a primeira linha do
// cabecalho: o resto muda quando a linha de codigo se desloca ou e editada.
const ISSUE_HEADER = /^TS(\d+) \[(ERROR|WARN)\]: (.*)$/u;
const ISSUE_ANCHOR = /^\s+at (file:\/\/\S+):(\d+):(\d+)\s*$/u;
const ERROR_SUMMARY = /Found (\d+) errors?\./u;

function parseDenoOutput(output, root) {
  const lines = normalizeEol(output).split("\n");
  const blocks = [];
  let current = null;

  for (const rawLine of lines) {
    const header = ISSUE_HEADER.exec(rawLine);
    if (header) {
      if (current) blocks.push(current);
      current = {
        code: `TS${header[1]}`,
        severity: header[2],
        message: normalizeWhitespace(header[3]),
        anchor: null,
      };
      continue;
    }
    if (!current) continue;
    const anchor = ISSUE_ANCHOR.exec(rawLine);
    if (anchor) {
      current.anchor = { file: anchor[1], line: Number(anchor[2]), column: Number(anchor[3]) };
      blocks.push(current);
      current = null;
    }
  }
  if (current) blocks.push(current);

  const readLines = createSourceLineReader(root);
  const issues = blocks
    .filter((block) => block.anchor)
    .map((block) => {
      const file = normalizeFilePath(block.anchor.file, root);
      return {
        file,
        line: block.anchor.line,
        column: block.anchor.column,
        severity: block.severity,
        code: block.code,
        message: block.message,
        contextHash: contextHashForLine(readLines, file, block.anchor.line),
      };
    })
    .sort((a, b) =>
      JSON.stringify([a.file, a.code, a.message, a.line, a.column]).localeCompare(
        JSON.stringify([b.file, b.code, b.message, b.line, b.column])
      )
    );

  const summary = ERROR_SUMMARY.exec(normalizeEol(output));

  return {
    issues,
    unanchored: blocks.filter((block) => !block.anchor).length,
    reportedCount: summary ? Number(summary[1]) : null,
  };
}

// Chave sem linha/coluna: um erro identico continua sendo "o mesmo" erro
// conhecido mesmo que outra edicao desloque a linha. Mudar a QUANTIDADE de
// ocorrencias iguais conta como novo/removido — ver diffMultisets.
function issueKey(issue) {
  return JSON.stringify([issue.file, issue.severity, issue.code, issue.message]);
}

function matchPhase(baselineIssues, currentIssues, baselineMatched, currentMatched, keyFor) {
  const available = new Map();
  baselineIssues.forEach((issue, index) => {
    if (baselineMatched.has(index)) return;
    const key = keyFor(issue);
    if (key === null) return;
    const bucket = available.get(key) ?? [];
    bucket.push(index);
    available.set(key, bucket);
  });

  currentIssues.forEach((issue, index) => {
    if (currentMatched.has(index)) return;
    const key = keyFor(issue);
    if (key === null) return;
    const bucket = available.get(key);
    if (!bucket || bucket.length === 0) return;
    const baselineIndex = bucket.shift();
    baselineMatched.add(baselineIndex);
    currentMatched.add(index);
  });
}

function diffMultisets(baselineIssues, currentIssues) {
  const baselineMatched = new Set();
  const currentMatched = new Set();

  matchPhase(baselineIssues, currentIssues, baselineMatched, currentMatched, (issue) =>
    issue.contextHash ? `${issueKey(issue)}::${issue.contextHash}` : null
  );
  matchPhase(baselineIssues, currentIssues, baselineMatched, currentMatched, (issue) =>
    issue.contextHash ? null : issueKey(issue)
  );

  const added = currentIssues.filter((_, index) => !currentMatched.has(index));
  const removed = baselineIssues.filter((_, index) => !baselineMatched.has(index));
  return { added, removed };
}

export function createBaseline(output, root = process.cwd()) {
  const { issues } = parseDenoOutput(output, root);
  return { schemaVersion: SCHEMA_VERSION, command: COMMAND, issues };
}

function validateBaseline(baseline) {
  if (!baseline || baseline.schemaVersion !== SCHEMA_VERSION || !Array.isArray(baseline.issues)) {
    throw new Error(
      `Baseline de deno check invalido ou com schema diferente de ${SCHEMA_VERSION}.`
    );
  }
}

export function compareBaseline(baseline, output, root = process.cwd()) {
  validateBaseline(baseline);
  const { issues } = parseDenoOutput(output, root);
  const { added, removed } = diffMultisets(baseline.issues, issues);
  return { baselineCount: baseline.issues.length, currentCount: issues.length, added, removed };
}

// Coerencia interna da saida do deno, independente de exit code:
// - todo cabecalho "TS#### [ERROR]" precisa ter uma ancora "at file://...";
// - o resumo "Found N errors." precisa bater com o numero de ancorados.
// Se nao bate, o parser esta cego para parte da saida — melhor falhar alto do
// que comparar um numero menor do que o deno reportou. Vale tambem para o modo
// --output (saida salva em arquivo), onde nao existe exit code para conferir:
// um arquivo truncado nao pode virar baseline.
export function assertCoherentOutput(output, root = process.cwd()) {
  const { issues, unanchored, reportedCount } = parseDenoOutput(output, root);

  if (unanchored > 0) {
    throw new Error(
      `deno check reportou ${unanchored} diagnostico(s) sem ancora "at file://...". ` +
        `O ratchet nao consegue localizar o arquivo desses erros e se recusa a ignora-los.`
    );
  }

  if (reportedCount !== null && reportedCount !== issues.length) {
    throw new Error(
      `deno check diz "Found ${reportedCount} errors." mas o parser reconheceu ${issues.length}. ` +
        `A saida do deno mudou de formato; o ratchet nao pode comparar assim.`
    );
  }

  return issues;
}

// Texto de saida para mensagens de erro: saida curta vem inteira, saida longa
// vem com cabeca + cauda, porque o motivo de uma falha de CLI aparece no fim.
export function describeOutput(
  output,
  maxHeadChars = MAX_OUTPUT_SNIPPET,
  maxTailLines = MAX_OUTPUT_TAIL_LINES
) {
  const text = stripAnsi(String(output ?? ""));
  if (text.trim() === "") return "(saida vazia)";

  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length <= maxTailLines) return lines.join("\n");

  const head = normalizeWhitespace(text).slice(0, maxHeadChars);
  const omitted = lines.length - maxTailLines;
  return (
    `inicio: ${head}\n` +
    `...[${omitted} linhas omitidas]...\n` +
    `fim:\n${lines.slice(-maxTailLines).join("\n")}`
  );
}

// Deno sai com 0 quando esta limpo e com 1 quando encontra erro de tipo. So
// esses dois casos podem alimentar o ratchet. O resto e falha de CLI
// (deno ausente, config quebrada, dependencia remota que nao baixou) e
// precisa ser ERRO, nunca "zero ocorrencias": era exatamente um falso zero
// desse tipo que deixava o typecheck-ratchet verde com o tsc quebrado.
export function assertUsableResult(status, output, root = process.cwd()) {
  if (status !== 0 && status !== 1) {
    throw new Error(`deno check falhou com exit ${status}: ${describeOutput(output)}`);
  }

  const issues = assertCoherentOutput(output, root);
  if (status === 0) return output;

  if (issues.length === 0) {
    const snippet = describeOutput(output);
    throw new Error(
      `deno check saiu com exit ${status} sem nenhum diagnostico parseavel ` +
        `(esperado "TS#### [ERROR]: mensagem" seguido de "at file://...:linha:coluna"). ` +
        `O ratchet se recusa a tratar isso como zero erros. Saida do deno: ${snippet}`
    );
  }

  return output;
}

export function listEntrypoints(root = process.cwd()) {
  const directory = path.join(root, FUNCTIONS_DIR);
  if (!existsSync(directory)) {
    throw new Error(`Diretorio de edge functions nao encontrado: ${directory}`);
  }
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${FUNCTIONS_DIR}/${entry.name}/index.ts`)
    .filter((relative) => existsSync(path.join(root, relative)))
    .sort();
}

function spawnDenoCheck(denoBin, entrypoints, root) {
  const result = spawnSync(denoBin, ["check", ...entrypoints], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

  if (result.error) {
    throw new Error(
      `Nao foi possivel executar "${denoBin}": ${result.error.message}. ` +
        `Instale o Deno ou passe --deno <caminho do binario>.`
    );
  }

  return { status: result.status, output: `${result.stdout ?? ""}\n${result.stderr ?? ""}` };
}

// Uma execucao do deno que termina sem nenhum diagnostico parseavel (exit 1 +
// zero "TS#### [ERROR]") nao e divida de tipo: e CLI/rede/registry. Isso vale
// outra tentativa; qualquer outra falha quebra na primeira. O ciclo fica aqui,
// com o runner injetado, para o teste cobrir o caso "registry caiu" sem binario.
export function runDenoWithAttempts(runAttempt, root, options = {}) {
  const attempts = options.attempts ?? MAX_ATTEMPTS;
  const onRetry =
    options.onRetry ??
    ((attempt) =>
      console.error(
        `deno check terminou sem diagnostico (tentativa ${attempt}/${attempts}); tentando de novo.`
      ));

  for (let attempt = 1; ; attempt += 1) {
    const { status, output } = runAttempt();
    try {
      return assertUsableResult(status, output, root);
    } catch (error) {
      const retryable = status === 1 && parseDenoOutput(output, root).issues.length === 0;
      if (!retryable || attempt >= attempts) throw error;
      onRetry(attempt);
    }
  }
}

function runDeno(root, denoBin) {
  const entrypoints = listEntrypoints(root);
  if (entrypoints.length === 0) {
    throw new Error(`Nenhuma edge function encontrada em ${FUNCTIONS_DIR}/*/index.ts`);
  }

  return runDenoWithAttempts(() => spawnDenoCheck(denoBin, entrypoints, root), root);
}

function parseArguments(argv) {
  const options = {
    baseline: DEFAULT_BASELINE,
    output: null,
    root: process.cwd(),
    deno: process.env.DENO_BIN || "deno",
    updateBaseline: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--update-baseline") {
      options.updateBaseline = true;
    } else if (
      argument === "--baseline" ||
      argument === "--output" ||
      argument === "--root" ||
      argument === "--deno"
    ) {
      const value = argv[index + 1];
      if (!value) throw new Error(`Valor ausente para ${argument}.`);
      options[argument.slice(2).replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase())] = value;
      index += 1;
    } else if (argument === "--help") {
      options.help = true;
    } else {
      throw new Error(`Argumento desconhecido: ${argument}`);
    }
  }

  options.root = path.resolve(options.root);
  options.baseline = path.resolve(options.root, options.baseline);
  if (options.output) options.output = path.resolve(options.root, options.output);
  return options;
}

function readJson(filePath, description) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Nao foi possivel ler ${description} em ${filePath}: ${error.message}`);
  }
}

// Modo --output: a saida vem de um arquivo, entao nao ha exit code do deno
// para validar. A coerencia da propria saida ainda e conferida, para um
// arquivo truncado nunca virar baseline.
function readCoherentOutput(filePath, root) {
  const output = readFileSync(filePath, "utf8");
  assertCoherentOutput(output, root);
  return output;
}

function formatIssue(issue) {
  return `${issue.file}(${issue.line},${issue.column}) ${issue.severity} ${issue.code} - ${issue.message}`;
}

export function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArguments(argv);
    if (options.help) {
      console.log(`Uso:
  node scripts/ci/deno-check-ratchet.mjs
  node scripts/ci/deno-check-ratchet.mjs --update-baseline

Opcoes de teste: --output <deno-check.txt> --baseline <arquivo> --root <diretorio> --deno <caminho>`);
      return 0;
    }

    const output = options.output
      ? readCoherentOutput(options.output, options.root)
      : runDeno(options.root, options.deno);

    if (options.updateBaseline) {
      const baseline = createBaseline(output, options.root);
      writeFileSync(options.baseline, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
      console.log(
        `Baseline de deno check atualizado: ${baseline.issues.length} ocorrencias em ${options.baseline}`
      );
      return 0;
    }

    const baseline = readJson(options.baseline, "baseline de deno check");
    const comparison = compareBaseline(baseline, output, options.root);
    console.log(
      `Deno check ratchet: baseline=${comparison.baselineCount}, atual=${comparison.currentCount}, ` +
        `removidas=${comparison.removed.length}, novas=${comparison.added.length}`
    );

    if (comparison.added.length === 0) {
      console.log("OK: nenhum novo erro de tipo nas edge functions.");
      return 0;
    }

    console.error("FALHA: novos erros de tipo nas edge functions:");
    for (const issue of comparison.added.slice(0, MAX_REPORTED_ISSUES)) {
      console.error(`  ${formatIssue(issue)}`);
    }
    if (comparison.added.length > MAX_REPORTED_ISSUES) {
      console.error(`  ... e mais ${comparison.added.length - MAX_REPORTED_ISSUES} ocorrencias.`);
    }
    console.error(
      "Corrija os novos erros. Atualize o baseline somente quando a nova divida tiver aprovacao explicita."
    );
    return 1;
  } catch (error) {
    console.error(`ERRO no deno check ratchet: ${error.message}`);
    return 2;
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = main();
}
