import assert from "node:assert/strict";
import test from "node:test";
import {
  baselineNames,
  entriesWithoutReason,
  findDrift,
  main,
  parseGeneratedTypes,
  parseMigrations,
} from "./schema-drift-guard.mjs";

const TYPES = `
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
        }
      }
      click_logs_partitioned_2026_01: {
        Row: {
          id: string
        }
      }
    }
    Views: {
      activities: {
        Row: {
          id: string
        }
      }
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
        }
      }
    }
  }
`;

const MIGRATIONS = [
  {
    path: "supabase/migrations/001.sql",
    source: [
      "-- CREATE TABLE public.comentada (id uuid)",
      "CREATE TABLE IF NOT EXISTS public.users (id uuid);",
      'create table public."audit_logs" (id uuid);',
      "CREATE MATERIALIZED VIEW public.mv_totais AS SELECT 1;",
    ].join("\n"),
  },
];

test("parseGeneratedTypes separa tabelas de views e ignora Functions", () => {
  assert.deepEqual(parseGeneratedTypes(TYPES), {
    tables: ["click_logs_partitioned_2026_01", "employees"],
    views: ["activities"],
  });
  assert.deepEqual(parseGeneratedTypes("sem bloco nenhum"), { tables: [], views: [] });
});

test("parseMigrations reconhece CREATE TABLE, aspas e view materializada", () => {
  const { tables, views } = parseMigrations(MIGRATIONS);
  assert.deepEqual(tables, ["audit_logs", "users"]);
  assert.deepEqual(views, ["mv_totais"]);
});

test("particao criada em tempo de execucao nao e drift quando o pai tem migration", () => {
  const drift = findDrift({
    tables: ["click_logs_partitioned_2026_01", "click_logs_partitioned"],
    views: [],
    createdTables: ["click_logs_partitioned"],
    createdViews: [],
  });
  assert.deepEqual(drift.tabelasNovas, []);
});

test("particao sem o pai em migration continua sendo drift", () => {
  const drift = findDrift({
    tables: ["click_logs_partitioned_2026_01"],
    views: [],
    createdTables: [],
    createdViews: [],
  });
  assert.deepEqual(drift.tabelasNovas, ["click_logs_partitioned_2026_01"]);
});

test("drift novo fora da baseline e acusado; baseline marca o conhecido", () => {
  const drift = findDrift({
    tables: ["achievements", "nova_tabela"],
    views: ["violations"],
    createdTables: ["users"],
    createdViews: [],
    baseline: {
      tabelas: [{ name: "achievements", reason: "criada fora do repositorio" }],
      views: [{ name: "violations", reason: "criada fora do repositorio" }],
    },
  });
  assert.deepEqual(drift.tabelasNovas, ["nova_tabela"]);
  assert.deepEqual(drift.tabelasConhecidas, ["achievements"]);
  assert.deepEqual(drift.viewsConhecidas, ["violations"]);
  assert.deepEqual(drift.viewsNovas, []);
});

test("entrada da baseline que saiu do drift aparece como resolvida", () => {
  const drift = findDrift({
    tables: ["users"],
    views: [],
    createdTables: ["users"],
    createdViews: [],
    baseline: { tabelas: [{ name: "departments", reason: "criada fora do repositorio" }] },
  });
  assert.deepEqual(drift.tabelasResolvidas, ["departments"]);
});

test("baseline aceita string, mas exige motivo nas excecoes", () => {
  assert.deepEqual(baselineNames(["users", { name: "departments" }]), ["users", "departments"]);
  assert.deepEqual(
    entriesWithoutReason([
      "users",
      { name: "departments", reason: " " },
      { name: "geo_blocks", reason: "ok" },
    ]),
    ["users", "departments"]
  );
});

test("o repositorio atual passa na guarda (drift historico esta na baseline)", () => {
  assert.equal(main(["--json"]), 0);
});
