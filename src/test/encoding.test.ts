/**
 * Guarda de codificação dos textos.
 *
 * A PR #272 corrigiu texto duplamente codificado (gravado como `M\u00c3\u00aas`
 * em vez de `Mês`) que vazou para o Dashboard (tela e leitor de tela) e para as
 * mensagens do Slack. Nenhum teste olhava o byte, então o CI continuava verde.
 * As amostras das sequências ruins ficam escapadas para não violarem a guarda.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["src", "supabase/functions"];
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".css", ".json"];
const SKIP_DIRS = new Set(["node_modules", "dist", "coverage", ".git"]);

// Sequências que só existem quando o texto foi codificado duas vezes:
// `\u00c3\u00aa` (Média), `\u00c2\u00b7` (ponto médio), `\u00e2\u0080\u0094`
// (travessão) e a versão tripla que apareceu nos arquivos do Slack.
const MOJIBAKE =
  /[\u00c3\u00c2][\u0080-\u00bf]|[\u00e2][\u0080-\u009f\u20ac\u201a-\u203a\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2122]/;

function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectFiles(join(dir, entry.name), out);
    } else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

describe("Codificação dos textos", () => {
  it("a própria guarda detecta mojibake", () => {
    const mes = "M" + String.fromCharCode(0xc3, 0xaa) + "s";
    const travessao = String.fromCharCode(0xe2, 0x80, 0x94);
    const bullet = String.fromCharCode(0xc2, 0xb7);

    expect(MOJIBAKE.test(mes)).toBe(true);
    expect(MOJIBAKE.test(travessao)).toBe(true);
    expect(MOJIBAKE.test(bullet)).toBe(true);
    expect(MOJIBAKE.test("Mês · ao vivo — ok")).toBe(false);
  });

  it("não há texto duplamente codificado nos arquivos de origem", () => {
    const files = ROOTS.flatMap((root) => collectFiles(root));
    // Sem isto, um caminho errado faria o teste passar sem checar nada.
    expect(files.length).toBeGreaterThan(500);

    const violations: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, "utf-8").split("\n");
      lines.forEach((line, index) => {
        if (MOJIBAKE.test(line)) {
          violations.push(`${file}:${index + 1}: ${line.trim().slice(0, 120)}`);
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it("os textos do Dashboard usam acentuação correta", () => {
    const dashboard = readFileSync("src/pages/DashboardPage.tsx", "utf-8");

    expect(dashboard).toContain("vs período anterior");
    expect(dashboard).toContain('aria-label="Período"');
    expect(MOJIBAKE.test(dashboard)).toBe(false);
  });
});
