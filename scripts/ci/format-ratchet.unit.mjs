import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { compareBaseline, createBaseline } from "./format-ratchet.mjs";

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "format-ratchet-"));
  return {
    root,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

test("createBaseline normaliza paths relativos e sem duplicatas", () => {
  const { root, cleanup } = fixture();
  try {
    const baseline = createBaseline(["./src/a.ts", "src/a.ts", "src\\b.tsx"], root);
    assert.equal(baseline.files.length, 2);
    assert.deepEqual(baseline.files, ["src/a.ts", "src/b.tsx"]);
    assert.equal(baseline.command, "prettier --list-different --ignore-unknown .");
  } finally {
    cleanup();
  }
});

test("compareBaseline aceita set identico e acusa arquivo novo", () => {
  const baseline = createBaseline(["src/a.ts", "src/b.tsx"], "/repo");
  const same = compareBaseline(baseline, ["src/a.ts", "src/b.tsx"], "/repo");
  assert.equal(same.added.length, 0);
  assert.equal(same.removed.length, 0);

  const grown = compareBaseline(baseline, ["src/a.ts", "src/b.tsx", "src/c.ts"], "/repo");
  assert.deepEqual(grown.added, ["src/c.ts"]);
  assert.equal(grown.removed.length, 0);
});

test("arquivo formatado (saiu do set) e divida paga, nao falha", () => {
  const baseline = createBaseline(["src/a.ts", "src/b.tsx"], "/repo");
  const comparison = compareBaseline(baseline, ["src/b.tsx"], "/repo");
  assert.equal(comparison.added.length, 0);
  assert.deepEqual(comparison.removed, ["src/a.ts"]);
});

test("troca de arquivo fora do padrao por outro e acusada", () => {
  const baseline = createBaseline(["src/a.ts"], "/repo");
  const comparison = compareBaseline(baseline, ["src/b.tsx"], "/repo");
  assert.deepEqual(comparison.added, ["src/b.tsx"]);
  assert.deepEqual(comparison.removed, ["src/a.ts"]);
});

test("mudanca de versao do Prettier ou da config bloqueia", () => {
  const baseline = createBaseline(["src/a.ts"], "/repo");
  baseline.prettierVersion = "99.0.0";
  assert.throws(
    () => compareBaseline(baseline, ["src/a.ts"], "/repo"),
    /mudou desde a geracao do baseline/
  );

  const configBaseline = createBaseline(["src/a.ts"], "/repo");
  configBaseline.configSha256 = "deadbeef";
  assert.throws(
    () => compareBaseline(configBaseline, ["src/a.ts"], "/repo"),
    /mudou desde a geracao do baseline/
  );
});

test("baseline com schema errado e rejeitado", () => {
  assert.throws(() => compareBaseline({ schemaVersion: 999, files: [] }, [], "/repo"), /invalido/);
});
