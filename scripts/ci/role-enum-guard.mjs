#!/usr/bin/env node
/**
 * Guarda contra valor inexistente no filtro de `user_roles.role`.
 *
 * `user_roles.role` e do enum `public.app_role`. Um valor que nao existe no enum
 * aborta a consulta INTEIRA no Postgres (22P02 "invalid input value for enum
 * app_role"), mesmo que o resto da lista seja valido:
 *
 *   GET /rest/v1/user_roles?select=role&role=in.(admin,supervisor)
 *   400 {"code":"22P02","message":"invalid input value for enum app_role: ..."}
 *
 * O buraco reapareceu em ondas: 5 edge functions respondiam 403 para todo admin
 * por causa de `super_admin` (#341) e o AuthProvider rebaixava todo admin para
 * 'user' na UI por causa de `supervisor` (#342). Os valores validos sao lidos do
 * tipo gerado a partir do banco (`src/integrations/supabase/types.ts`), entao a
 * guarda acompanha o schema sem manter uma lista paralela aqui.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SCHEMA_VERSION = 1;
const TYPES_FILE = "src/integrations/supabase/types.ts";
const SCAN_DIRS = ["supabase/functions", "src"];
const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".next", "coverage", ".git"]);
const MAX_REPORTED = 50;

export function parseAppRoleEnum(typesText) {
  const match = typesText.match(/app_role:\s*\[([^\]]*)\]/);
  if (!match) return null;
  return match[1]
    .split(",")
    .map((value) => value.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
}

export function extractStringLiterals(text) {
  const literals = [];
  for (const match of stripComments(text).matchAll(/['"`]([^'"`\n]*)['"`]/g)) {
    if (match[1]) literals.push(match[1]);
  }
  return literals;
}

function readBracketed(source, openIndex) {
  let depth = 0;
  let quote = "";
  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (char === quote && source[i - 1] !== "\\") quote = "";
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, i);
    }
  }
  return null;
}

export function resolveConstant(source, name) {
  const declaration = new RegExp(`(?:const|let|var)\\s+${name}\\s*(?::[^=]+)?=\\s*\\[`).exec(
    source
  );
  if (!declaration) return null;
  const body = readBracketed(source, declaration.index + declaration[0].length - 1);
  if (body === null) return null;
  const values = extractStringLiterals(body);
  return values.length > 0 ? values : null;
}

export function extractRoleFilters(source) {
  const filters = [];
  const pattern = /\.(?:in|eq)\(\s*['"`]role['"`]\s*,\s*/g;
  for (const match of source.matchAll(pattern)) {
    const line = source.slice(0, match.index).split("\n").length;
    const openIndex = match.index + match[0].indexOf("(");
    const call = readBracketed(source, openIndex);
    if (call === null) {
      filters.push({ line, values: null });
      continue;
    }
    // Remove o nome da coluna (`'role', `) que a propria regex ja consumiu.
    const argument = call.replace(/^\s*['"`]role['"`]\s*,\s*/, "").trim();
    if (argument.startsWith("[")) {
      // `[...ELEVATED_ROLES]`: spread de constante declarada no proprio arquivo.
      const spread = /\.\.\.\s*([A-Za-z_$][A-Za-z0-9_$]*)/.exec(argument);
      if (spread) {
        const resolved = resolveConstant(source, spread[1]);
        const inline = extractStringLiterals(
          argument.replace(/\.\.\.\s*[A-Za-z_$][A-Za-z0-9_$]*/g, "")
        );
        filters.push({ line, values: resolved ? [...inline, ...resolved] : null, argument });
        continue;
      }
      const values = extractStringLiterals(argument);
      filters.push({ line, values: values.length > 0 ? values : null, argument });
      continue;
    }
    if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(argument)) {
      filters.push({ line, values: resolveConstant(source, argument), argument });
      continue;
    }
    // Expressao dinamica (ex.: `role.name.toLowerCase()`): o valor nao pode ser
    // provado na analise estatica, entao nao entra como violacao.
    filters.push({ line, values: "dinamico", argument });
  }
  return filters;
}

export function extractHasRoleCalls(source) {
  const calls = [];
  for (const match of source.matchAll(/has_role\(\s*[^,()]+,\s*['"]([^'"\n]+)['"]/g)) {
    calls.push({ line: source.slice(0, match.index).split("\n").length, value: match[1] });
  }
  return calls;
}

export function collectFiles(root) {
  const files = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
        continue;
      }
      if (/\.(ts|tsx)$/.test(entry.name)) files.push(path.join(dir, entry.name));
    }
  };
  for (const dir of SCAN_DIRS) walk(path.join(root, dir));
  return files.sort();
}

export function analyze({ documents, allowed }) {
  const violations = [];
  for (const { path: filePath, source } of documents) {
    const queriesRoles = /from\(\s*['"`]user_roles['"`]\s*\)/.test(source);
    if (queriesRoles) {
      for (const filter of extractRoleFilters(source)) {
        if (filter.values === "dinamico") continue;
        if (filter.values === null) {
          violations.push({
            path: filePath,
            line: filter.line,
            value: filter.argument ?? "?",
            detail: "valor do filtro de role nao resolvido",
          });
          continue;
        }
        for (const value of filter.values) {
          if (!allowed.includes(value)) {
            violations.push({ path: filePath, line: filter.line, value });
          }
        }
      }
    }
    for (const call of extractHasRoleCalls(source)) {
      if (!allowed.includes(call.value)) {
        violations.push({ path: filePath, line: call.line, value: call.value });
      }
    }
  }
  return violations;
}

function parseArguments(argv) {
  const options = { root: process.cwd(), json: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--root") {
      options.root = argv[i + 1];
      i += 1;
      continue;
    }
    if (argv[i] === "--json") {
      options.json = true;
      continue;
    }
    if (argv[i] === "--help" || argv[i] === "-h") {
      options.help = true;
    }
  }
  return options;
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  if (options.help) {
    console.log("uso: node scripts/ci/role-enum-guard.mjs [--root <dir>] [--json]");
    return 0;
  }

  const root = path.resolve(options.root);
  const typesText = fs.readFileSync(path.join(root, TYPES_FILE), "utf8");
  const allowed = parseAppRoleEnum(typesText);
  if (!allowed || allowed.length === 0) {
    console.error(`ERRO: nao foi possivel ler a lista de valores de app_role em ${TYPES_FILE}`);
    return 1;
  }

  const documents = collectFiles(root).map((filePath) => ({
    path: path.relative(root, filePath).split(path.sep).join("/"),
    source: fs.readFileSync(filePath, "utf8"),
  }));
  const violations = analyze({ documents, allowed });

  if (options.json) {
    console.log(JSON.stringify({ schemaVersion: SCHEMA_VERSION, allowed, violations }, null, 2));
  } else {
    console.log(
      `Valor de papel em user_roles: ${documents.length} arquivo(s), app_role = ${allowed.join(", ")}`
    );
    if (violations.length === 0) {
      console.log("OK: nenhum filtro de user_roles.role usa valor fora do enum.");
    } else {
      for (const violation of violations.slice(0, MAX_REPORTED)) {
        const detail = violation.detail ? ` (${violation.detail})` : "";
        console.error(
          `::error file=${violation.path},line=${violation.line}::'${violation.value}' nao existe no enum app_role${detail}`
        );
      }
      if (violations.length > MAX_REPORTED) {
        console.error(`... e ${violations.length - MAX_REPORTED} outra(s) ocorrencia(s)`);
      }
      console.error(
        `FALHA: ${violations.length} uso(s) de valor inexistente em app_role. Filtro com valor invalido aborta a consulta inteira (22P02).`
      );
    }
  }

  return violations.length === 0 ? 0 : 1;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = main();
}
