/**
 * Guarda do contrato de dados entre o front e o banco.
 *
 * Toda chamada literal que o front faz ao Supabase (`.from()` com nome literal,
 * .rpc() e storage.from() com nome literal) precisa existir no tipo gerado
 * (`src/integrations/supabase/types.ts`) ou nas migrations do repositorio.
 * Sem esta checagem, uma tabela renomeada ou ausente so aparece como erro em
 * producao — foi a causa do incidente de 22/11, com 10 tabelas consumidas pelo
 * front que nao existiam no banco.
 *
 * Limite conhecido: so valida chamadas com nome literal. `.from(variável)` nao
 * e resolvivel estaticamente; hoje o repositorio nao tem nenhuma.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const EXTENSIONS = [".ts", ".tsx"];
const SKIP_DIRS = new Set(["node_modules", "dist", "coverage", ".git"]);
const TYPES_FILE = "src/integrations/supabase/types.ts";
const MIGRATIONS_DIR = "supabase/migrations";

function collectSources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectSources(join(dir, entry.name), out);
    } else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

const sourceFiles = collectSources("src");
const projectTypes = readFileSync(TYPES_FILE, "utf-8");
const migrationsSql = readdirSync(MIGRATIONS_DIR)
  .filter((file) => file.endsWith(".sql"))
  .map((file) => readFileSync(join(MIGRATIONS_DIR, file), "utf-8"))
  .join("\n");

// Entradas de `Tables` e `Views` do tipo gerado (ambas tem `Row`).
const typedRelations = new Set(
  [...projectTypes.matchAll(/^\s{6}([a-z0-9_]+):\s*\{\n\s{8}Row:\s*\{/gm)].map((match) => match[1])
);
// Entradas de `Functions` do tipo gerado.
const typedFunctions = new Set(
  [...projectTypes.matchAll(/^\s{6}([a-z0-9_]+):\s*\{\n\s{8}Args:/gm)].map((match) => match[1])
);
const migratedRelations = new Set([
  ...[...migrationsSql.matchAll(/create table (?:if not exists )?(?:public\.)?([a-z0-9_]+)/gi)].map(
    (m) => m[1].toLowerCase()
  ),
  ...[
    ...migrationsSql.matchAll(
      /create (?:or replace )?(?:materialized )?view (?:public\.)?([a-z0-9_]+)/gi
    ),
  ].map((m) => m[1].toLowerCase()),
]);
const migratedFunctions = new Set(
  [...migrationsSql.matchAll(/create (?:or replace )?function (?:public\.)?([a-z0-9_]+)/gi)].map(
    (m) => m[1].toLowerCase()
  )
);
const migratedBuckets = new Set(
  [
    ...migrationsSql.matchAll(
      /INSERT INTO storage\.buckets[\s\S]{0,200}?VALUES\s*\(\s*'([a-z0-9_-]+)'/gi
    ),
  ].map((m) => m[1])
);

const knownRelations = new Set([...typedRelations, ...migratedRelations]);
const knownFunctions = new Set([...typedFunctions, ...migratedFunctions]);

function collectReferences(pattern: RegExp, strip: RegExp | null = null) {
  const found = new Map<string, Set<string>>();
  for (const file of sourceFiles) {
    const source = strip
      ? readFileSync(file, "utf-8").replace(strip, "")
      : readFileSync(file, "utf-8");
    for (const match of source.matchAll(pattern)) {
      const name = match[1];
      if (!found.has(name)) found.set(name, new Set());
      found.get(name)!.add(file);
    }
  }
  return found;
}

function unresolved(found: Map<string, Set<string>>, known: Set<string>) {
  return [...found.entries()]
    .filter(([name]) => !known.has(name.toLowerCase()))
    .map(([name, files]) => `${name} (${[...files].join(", ")})`);
}

describe("Contrato de dados front x banco", () => {
  it("os nomes extraidos do tipo gerado e das migrations sao plausiveis", () => {
    // Se o parser quebrar (mudanca de formato em types.ts), os testes abaixo
    // passariam vazios. Estas checagens evitam esse falso verde.
    expect(sourceFiles.length).toBeGreaterThan(500);
    expect(typedRelations.size).toBeGreaterThan(100);
    expect(typedFunctions.size).toBeGreaterThan(5);
    expect(migratedRelations.size).toBeGreaterThan(100);
    expect(migratedBuckets.size).toBeGreaterThan(0);
  });

  it("toda tabela consultada pelo front existe no banco", () => {
    const tables = collectReferences(
      /\.from\(\s*["'`]([a-z0-9_]+)["'`]\s*\)/g,
      /storage\s*\.from\(\s*["'`][a-z0-9_-]+["'`]\s*\)/g
    );

    expect(tables.size).toBeGreaterThan(50);
    expect(unresolved(tables, knownRelations)).toEqual([]);
  });

  it("toda funcao RPC chamada pelo front existe no banco", () => {
    const calls = collectReferences(/\.rpc\(\s*["'`]([a-z0-9_]+)["'`]/g);

    expect(calls.size).toBeGreaterThan(3);
    expect(unresolved(calls, knownFunctions)).toEqual([]);
  });

  it("todo bucket de storage usado existe nas migrations", () => {
    const buckets = collectReferences(/storage\s*\.from\(\s*["'`]([a-z0-9_-]+)["'`]\s*\)/g);

    expect(unresolved(buckets, migratedBuckets)).toEqual([]);
  });
});
