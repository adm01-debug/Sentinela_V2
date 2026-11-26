#!/usr/bin/env node
/**
 * Guarda de drift entre o schema vivo e as migrations.
 *
 * `src/integrations/supabase/types.ts` e gerado a partir do banco, entao ele
 * lista o que EXISTE em producao. As migrations sao o que um ambiente novo
 * consegue reconstruir. Quando os dois divergem, o banco tem objeto que nasceu
 * fora do repositorio: ninguem sabe quem criou, com qual DDL e com qual RLS --
 * `docs/agentes/banco.md` registrou 9 tabelas vivas sem migration e 3 delas com
 * `relrowsecurity = false` (leitura e escrita abertas para qualquer autenticado).
 *
 * A guarda compara os dois lados e falha apenas com drift NOVO. A divida
 * historica fica em `scripts/ci/schema-drift-baseline.json`, com motivo
 * obrigatorio; entrada da baseline que deixar de ser drift gera AVISO (dai em
 * diante a lista pode ser podada).
 *
 * Particoes mensais (`x_partitioned_2026_01`) nao entram como drift: elas sao
 * criadas em tempo de execucao por `create_monthly_partition`, entao basta o pai
 * (`x_partitioned`) ter `CREATE TABLE` em migration.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SCHEMA_VERSION = 1;
const TYPES_FILE = "src/integrations/supabase/types.ts";
const MIGRATIONS_DIR = "supabase/migrations";
const BASELINE_FILE = "scripts/ci/schema-drift-baseline.json";
const PARTITION_RE = /^(.+)_partitioned_\d{4}_\d{2}$/;
const MAX_REPORTED = 50;

function namesInBlock(text, start, end) {
  const from = text.indexOf(start);
  if (from < 0) return [];
  const to = text.indexOf(end, from);
  const slice = text.slice(from, to < 0 ? undefined : to);
  const names = new Set();
  for (const match of slice.matchAll(/^ {6}([A-Za-z0-9_]+): \{/gm)) names.add(match[1]);
  return [...names].sort();
}

export function parseGeneratedTypes(typesText) {
  return {
    tables: namesInBlock(typesText, "Tables: {", "Views: {"),
    views: namesInBlock(typesText, "Views: {", "Functions: {"),
  };
}

export function parseMigrations(documents) {
  const tables = new Set();
  const views = new Set();
  for (const { source } of documents) {
    const clean = source.replace(/--[^\n]*/g, " ");
    for (const match of clean.matchAll(
      /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:only\s+)?(?:"?public"?\s*\.\s*)?"?([A-Za-z0-9_]+)"?/gi
    )) {
      tables.add(match[1].toLowerCase());
    }
    for (const match of clean.matchAll(
      /create\s+(?:or\s+replace\s+)?(?:materialized\s+)?view\s+(?:if\s+not\s+exists\s+)?(?:"?public"?\s*\.\s*)?"?([A-Za-z0-9_]+)"?/gi
    )) {
      views.add(match[1].toLowerCase());
    }
  }
  return { tables: [...tables].sort(), views: [...views].sort() };
}

function entryName(entry) {
  return typeof entry === "string" ? entry : entry?.name;
}

export function baselineNames(entries) {
  return (entries ?? []).map(entryName).filter(Boolean);
}

export function entriesWithoutReason(entries) {
  return (entries ?? [])
    .filter((entry) => typeof entry === "string" || !String(entry?.reason ?? "").trim())
    .map(entryName)
    .filter(Boolean);
}

export function findDrift({ tables, views, createdTables, createdViews, baseline = {} }) {
  const created = new Set(createdTables);
  const createdV = new Set(createdViews);
  const knownTables = new Set(baselineNames(baseline.tabelas));
  const knownViews = new Set(baselineNames(baseline.views));

  const semMigration = (name) => {
    if (created.has(name)) return false;
    const partition = PARTITION_RE.exec(name);
    return !(partition && created.has(`${partition[1]}_partitioned`));
  };

  const driftTables = tables.filter(semMigration);
  const driftViews = views.filter((name) => !createdV.has(name));

  return {
    tabelasNovas: driftTables.filter((name) => !knownTables.has(name)),
    viewsNovas: driftViews.filter((name) => !knownViews.has(name)),
    tabelasConhecidas: driftTables.filter((name) => knownTables.has(name)),
    viewsConhecidas: driftViews.filter((name) => knownViews.has(name)),
    tabelasResolvidas: [...knownTables].filter((name) => !driftTables.includes(name)),
    viewsResolvidas: [...knownViews].filter((name) => !driftViews.includes(name)),
  };
}

function readMigrations(root) {
  const dir = path.join(root, MIGRATIONS_DIR);
  if (!fs.existsSync(dir)) {
    throw new Error(`diretorio de migrations ausente: ${MIGRATIONS_DIR}`);
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => ({
      path: `${MIGRATIONS_DIR}/${name}`,
      source: fs.readFileSync(path.join(dir, name), "utf8"),
    }));
}

export function analyze({ root, baseline }) {
  const typesText = fs.readFileSync(path.join(root, TYPES_FILE), "utf8");
  const { tables, views } = parseGeneratedTypes(typesText);
  if (tables.length === 0) {
    throw new Error(`nao foi possivel ler as tabelas de ${TYPES_FILE}`);
  }
  const created = parseMigrations(readMigrations(root));
  return {
    tables,
    views,
    drift: findDrift({
      tables,
      views,
      createdTables: created.tables,
      createdViews: created.views,
      baseline,
    }),
  };
}

function readBaseline(root) {
  const file = path.join(root, BASELINE_FILE);
  if (!fs.existsSync(file)) return { tabelas: [], views: [] };
  return JSON.parse(fs.readFileSync(file, "utf8"));
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
    if (argv[i] === "--help" || argv[i] === "-h") options.help = true;
  }
  return options;
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  if (options.help) {
    console.log("uso: node scripts/ci/schema-drift-guard.mjs [--root <dir>] [--json]");
    return 0;
  }

  const root = path.resolve(options.root);
  const baseline = readBaseline(root);
  const { tables, views, drift } = analyze({ root, baseline });
  const semMotivo = [
    ...entriesWithoutReason(baseline.tabelas),
    ...entriesWithoutReason(baseline.views),
  ];
  const novas = drift.tabelasNovas.length + drift.viewsNovas.length + semMotivo.length;

  if (options.json) {
    console.log(
      JSON.stringify(
        { schemaVersion: SCHEMA_VERSION, ...drift, baselineSemMotivo: semMotivo },
        null,
        2
      )
    );
  } else {
    console.log(
      `Schema vivo x migrations: ${tables.length} tabela(s) e ${views.length} view(s) no tipo gerado, ` +
        `${drift.tabelasConhecidas.length + drift.viewsConhecidas.length} objeto(s) na baseline`
    );
    for (const name of drift.tabelasNovas.slice(0, MAX_REPORTED)) {
      console.error(
        `::error file=${TYPES_FILE}::tabela '${name}' existe no banco e nao tem CREATE TABLE em nenhuma migration`
      );
    }
    for (const name of drift.viewsNovas.slice(0, MAX_REPORTED)) {
      console.error(
        `::error file=${TYPES_FILE}::view '${name}' existe no banco e nao tem CREATE VIEW em nenhuma migration`
      );
    }
    for (const name of [...drift.tabelasResolvidas, ...drift.viewsResolvidas]) {
      console.warn(
        `::warning file=${BASELINE_FILE}::'${name}' saiu do drift; remova a entrada da baseline`
      );
    }
    for (const name of semMotivo) {
      console.error(
        `::error file=${BASELINE_FILE}::'${name}' esta na baseline sem motivo; toda excecao precisa de justificativa`
      );
    }
    if (novas === 0) {
      console.log("OK: nenhum objeto novo no banco fora das migrations.");
    } else {
      console.error(
        `FALHA: ${novas} pendencia(s) de schema. Escreva a migration com a DDL (e o RLS) ou, se for ` +
          `legitimo, registre na baseline com motivo.`
      );
    }
  }

  return novas === 0 ? 0 : 1;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = main();
}
