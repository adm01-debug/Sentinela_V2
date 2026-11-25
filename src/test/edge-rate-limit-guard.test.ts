/**
 * Guarda do rate limit das edge functions.
 *
 * Toda edge function que chama `checkRateLimit` precisa consumir o resultado
 * pelos campos que `RateLimitResult` realmente declara (hoje `allowed`,
 * `remaining`, `resetAt`, `retryAfter`). A versao antiga de
 * `award-gamification-points` lia `rateLimitResult.error` — campo que nunca
 * existiu — e o limite de 10 req/min ficou inoperante em producao sem o CI
 * perceber: o `deno check` nao roda no pipeline e a condicao era sempre falsa.
 *
 * A lista de campos validos e lida de `_shared/rateLimiting.ts`, entao o guarda
 * acompanha o contrato em vez de congelar nomes aqui.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const FUNCTIONS_DIR = "supabase/functions";
const RATE_LIMIT_SOURCE = join(FUNCTIONS_DIR, "_shared", "rateLimiting.ts");
const ASSIGNMENT = /(?:const|let|var)\s+(\w+)\s*=\s*(?:await\s+)?checkRateLimit\s*\(/g;

const source = readFileSync(RATE_LIMIT_SOURCE, "utf-8");
const interfaceBody = source.match(/interface RateLimitResult\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
const resultFields = new Set(
  [...interfaceBody.matchAll(/^\s{2}(\w+)\??:/gm)].map((match) => match[1])
);

const edgeFiles = readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(FUNCTIONS_DIR, entry.name, "index.ts")))
  .map((entry) => join(FUNCTIONS_DIR, entry.name, "index.ts"))
  .filter((file) => readFileSync(file, "utf-8").includes("checkRateLimit("));

type Violation = { file: string; detail: string };

function inspect(file: string): Violation[] {
  const code = readFileSync(file, "utf-8");
  const violations: Violation[] = [];

  for (const match of code.matchAll(ASSIGNMENT)) {
    const variable = match[1];
    const rest = code.slice((match.index ?? 0) + match[0].length);

    if (!new RegExp(`\\b${variable}\\b`).test(rest)) {
      violations.push({ file, detail: `resultado de ${variable} e calculado e nunca usado` });
      continue;
    }

    for (const usage of rest.matchAll(new RegExp(`\\b${variable}\\.(\\w+)`, "g"))) {
      if (!resultFields.has(usage[1])) {
        violations.push({ file, detail: `${variable}.${usage[1]} nao existe em RateLimitResult` });
      }
    }
  }

  return violations;
}

const violations = edgeFiles.flatMap(inspect);

describe("rate limit das edge functions", () => {
  it("declara os campos esperados em RateLimitResult", () => {
    expect([...resultFields].sort()).toEqual(["allowed", "remaining", "resetAt", "retryAfter"]);
  });

  it("encontra as edge functions que aplicam rate limit", () => {
    // Se este numero cair, o padrao de uso mudou e o guarda parou de casar.
    // 17 = piso atual: a limpeza das 38 edges legadas sem chamador (25/11/2026)
    // levou 5 das 23 que aplicavam rate limit, e a #312 levou outras 2
    // (get-employee-schedule e get-employee-timeline).
    expect(edgeFiles.length).toBeGreaterThanOrEqual(17);
    // Canario do caso que originou o guarda (bug de rate limit da #275).
    expect(edgeFiles).toContain(join(FUNCTIONS_DIR, "award-gamification-points", "index.ts"));
  });

  it("consome o resultado de checkRateLimit apenas por campos existentes", () => {
    expect(violations.map((v) => `${v.file}: ${v.detail}`)).toEqual([]);
  });
});
