import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  assertUsableResult,
  compareBaseline,
  createBaseline,
  describeOutput,
  listEntrypoints,
  main,
  runDenoWithAttempts,
} from "./deno-check-ratchet.mjs";

const ROOT = "/repo";

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "deno-check-ratchet-"));
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

const SAMPLE_OUTPUT = [
  "Check supabase/functions/audit-export/index.ts",
  "TS18046 [ERROR]: 'err' is of type 'unknown'.",
  "    return new Response(JSON.stringify({ error: err.message }), { status: 500 });",
  "                                                ~~~",
  "    at file:///home/runner/work/r/r/supabase/functions/audit-export/index.ts:50:49",
  "",
  "TS2538 [ERROR]: Type 'undefined' cannot be used as an index type.",
  "      violationsBySeverity[v.severity] = (violationsBySeverity[v.severity] || 0) + 1;",
  "                           ~~~~~~~~~~",
  "    at file:///home/runner/work/r/r/supabase/functions/summarize-activity/index.ts:107:28",
  "",
  "Found 2 errors.",
  "error: Type checking failed.",
].join("\n");

function captureConsole(run) {
  const logs = [];
  const errors = [];
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (...args) => logs.push(args.join(" "));
  console.error = (...args) => errors.push(args.join(" "));
  try {
    return { exitCode: run(), logs, errors };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

test("createBaseline extrai codigo/mensagem e normaliza o caminho do arquivo", () => {
  const baseline = createBaseline(SAMPLE_OUTPUT, ROOT);
  assert.equal(baseline.schemaVersion, 1);
  assert.equal(baseline.issues.length, 2);
  assert.deepEqual(
    baseline.issues.map((issue) => [issue.file, issue.code]),
    [
      ["supabase/functions/audit-export/index.ts", "TS18046"],
      ["supabase/functions/summarize-activity/index.ts", "TS2538"],
    ]
  );
  assert.equal(baseline.issues[0].message, "'err' is of type 'unknown'.");
});

test("createBaseline aceita caminho com espaco escapado e saida com escape ANSI", () => {
  const output = [
    "\u001b[1mTS2322 [ERROR]: Type 'string' is not assignable to type 'number'.\u001b[0m",
    "\u001b[32m  const x: number = 'a';\u001b[0m",
    "    at file:///mnt/c/Users/Joaquim%20Ataides/repo/supabase/functions/bulk-update/index.ts:9:7",
    "",
    "Found 1 error.",
  ].join("\n");
  const baseline = createBaseline(output, ROOT);
  assert.equal(baseline.issues.length, 1);
  assert.equal(baseline.issues[0].file, "supabase/functions/bulk-update/index.ts");
  assert.equal(baseline.issues[0].line, 9);
  assert.equal(baseline.issues[0].column, 7);
});

test("compareBaseline nao acusa nada quando a saida bate com o baseline", () => {
  const baseline = createBaseline(SAMPLE_OUTPUT, ROOT);
  const comparison = compareBaseline(baseline, SAMPLE_OUTPUT, ROOT);
  assert.equal(comparison.baselineCount, 2);
  assert.equal(comparison.currentCount, 2);
  assert.equal(comparison.added.length, 0);
  assert.equal(comparison.removed.length, 0);
});

test("compareBaseline acusa erro novo", () => {
  const baseline = createBaseline(SAMPLE_OUTPUT, ROOT);
  const comErroNovo = SAMPLE_OUTPUT.replace(
    "Found 2 errors.",
    [
      "TS2345 [ERROR]: Argument of type 'string' is not assignable to parameter of type 'number'.",
      "    at file:///repo/supabase/functions/send-webhook/index.ts:12:5",
      "",
      "Found 3 errors.",
    ].join("\n")
  );
  const comparison = compareBaseline(baseline, comErroNovo, ROOT);
  assert.equal(comparison.added.length, 1);
  assert.equal(comparison.added[0].file, "supabase/functions/send-webhook/index.ts");
  assert.equal(comparison.added[0].code, "TS2345");
  assert.equal(comparison.removed.length, 0);
});

test("compareBaseline reconhece erro corrigido (removido) sem falhar", () => {
  const baseline = createBaseline(SAMPLE_OUTPUT, ROOT);
  const soUmRestante = SAMPLE_OUTPUT.split("\n").slice(0, 5).join("\n");
  const comparison = compareBaseline(baseline, soUmRestante, ROOT);
  assert.equal(comparison.added.length, 0);
  assert.equal(comparison.removed.length, 1);
  assert.equal(comparison.removed[0].code, "TS2538");
});

test("compareBaseline trata deslocamento de linha no mesmo erro como nao-novo", () => {
  const baseline = createBaseline(SAMPLE_OUTPUT, ROOT);
  const deslocado = SAMPLE_OUTPUT.replace("index.ts:107:28", "index.ts:131:28");
  const comparison = compareBaseline(baseline, deslocado, ROOT);
  assert.equal(comparison.added.length, 0);
  assert.equal(comparison.removed.length, 0);
});

test("compareBaseline distingue duas ocorrencias identicas de uma so (multiset real)", () => {
  const baseline = createBaseline(SAMPLE_OUTPUT, ROOT);
  const duplicado = `${SAMPLE_OUTPUT}\nTS2538 [ERROR]: Type 'undefined' cannot be used as an index type.\n      outro[v.severity] = 1;\n    at file:///repo/supabase/functions/summarize-activity/index.ts:140:20\n\nFound 3 errors.`;
  const comparison = compareBaseline(baseline, duplicado, ROOT);
  assert.equal(comparison.added.length, 1, "a terceira ocorrencia identica deve contar como nova");
});

test("compareBaseline detecta troca real (uma corrigida + outra identica nova) usando o contexto do codigo", () => {
  const { root, cleanup } = fixture();
  try {
    mkdirSync(path.join(root, "supabase", "functions", "x"), { recursive: true });
    const filePath = path.join(root, "supabase", "functions", "x", "index.ts");

    const antes =
      [
        "// fn a",
        "function a() { return contact.tags.join(','); }",
        "// shield-top",
        "function b() { return contact.tags.join(';'); }",
        "function c() { return contact.tags.join('-'); }",
        "// shield-bottom",
      ].join("\n") + "\n";
    writeFileSync(filePath, antes, "utf8");

    const anchor = "at file:///repo/supabase/functions/x/index.ts";
    const erro = "TS18049 [ERROR]: 'contact.tags' is possibly 'null' or 'undefined'.";
    const baselineOutput = [
      erro,
      `    ${anchor}:2:10`,
      erro,
      `    ${anchor}:4:10`,
      erro,
      `    ${anchor}:5:10`,
    ].join("\n");
    const baseline = createBaseline(baselineOutput, root);
    assert.ok(
      baseline.issues.every((issue) => issue.contextHash),
      "as tres ocorrencias deveriam ter contexto calculado"
    );

    const depois =
      [
        "// shield-top",
        "function b() { return contact.tags.join(';'); }",
        "function c() { return contact.tags.join('-'); }",
        "// shield-bottom",
        "// fn d",
        "function d() { return contact.tags.join('|'); }",
      ].join("\n") + "\n";
    writeFileSync(filePath, depois, "utf8");

    const currentOutput = [
      erro,
      `    ${anchor}:2:10`,
      erro,
      `    ${anchor}:3:10`,
      erro,
      `    ${anchor}:6:10`,
    ].join("\n");

    const comparison = compareBaseline(baseline, currentOutput, root);
    assert.equal(comparison.added.length, 1, "a ocorrencia nova na funcao d deveria ser detectada");
    assert.equal(comparison.added[0].line, 6);
    assert.equal(
      comparison.removed.length,
      1,
      "a ocorrencia corrigida na funcao a deveria sair do baseline"
    );
  } finally {
    cleanup();
  }
});

test("createBaseline nao le arquivo fora do root ('..' na ancora)", () => {
  const { root, cleanup } = fixture();
  const outside = path.join(path.dirname(root), `outside-${path.basename(root)}.ts`);
  try {
    writeFileSync(outside, "const secret = 1;\nconst leak = secret;\nconst tail = leak;\n", "utf8");
    const relativo = path
      .relative(path.join(root, "supabase", "functions"), outside)
      .split(path.sep)
      .join("/");
    const output = `TS9999 [ERROR]: 'leak' is possibly 'undefined'.\n    at file:///repo/supabase/functions/${relativo}:2:7\n\nFound 1 error.`;
    const baseline = createBaseline(output, root);
    assert.equal(baseline.issues.length, 1);
    assert.equal(baseline.issues[0].contextHash, null, "arquivo fora do root nao deveria ser lido");
  } finally {
    unlinkSync(outside);
    cleanup();
  }
});

test("assertUsableResult aceita exit 0 limpo e exit 1 com diagnostico coerente", () => {
  assert.equal(
    assertUsableResult(0, "Check supabase/functions/x/index.ts\n", ROOT).length > 0,
    true
  );
  assert.ok(assertUsableResult(1, SAMPLE_OUTPUT, ROOT));
});

test("assertUsableResult recusa exit 1 sem diagnostico parseavel (falso zero)", () => {
  assert.throws(
    () => assertUsableResult(1, 'error: Module not found "https://deno.land/x/y/mod.ts".\n', ROOT),
    /sem nenhum diagnostico parseavel/u
  );
});

test("assertUsableResult recusa cabecalho sem ancora (parser cego)", () => {
  const output = [
    "TS2322 [ERROR]: Type 'string' is not assignable to type 'number'.",
    "  const x: number = 'a';",
    "",
    "Found 1 error.",
  ].join("\n");
  assert.throws(() => assertUsableResult(1, output, ROOT), /sem ancora/u);
});

test("assertUsableResult recusa resumo que nao bate com o numero de diagnosticos", () => {
  const inconsistente = SAMPLE_OUTPUT.replace("Found 2 errors.", "Found 3 errors.");
  assert.throws(() => assertUsableResult(1, inconsistente, ROOT), /Found 3 errors/u);
});

test("assertUsableResult recusa exit inesperado do deno", () => {
  assert.throws(() => assertUsableResult(2, SAMPLE_OUTPUT, ROOT), /exit 2/u);
});

test("listEntrypoints so devolve pastas com index.ts, em ordem", () => {
  const { root, cleanup } = fixture();
  try {
    mkdirSync(path.join(root, "supabase", "functions", "b"), { recursive: true });
    mkdirSync(path.join(root, "supabase", "functions", "a"), { recursive: true });
    mkdirSync(path.join(root, "supabase", "functions", "_shared"), { recursive: true });
    writeFileSync(path.join(root, "supabase", "functions", "a", "index.ts"), "", "utf8");
    writeFileSync(path.join(root, "supabase", "functions", "b", "index.ts"), "", "utf8");
    writeFileSync(path.join(root, "supabase", "functions", "_shared", "auth.ts"), "", "utf8");
    assert.deepEqual(listEntrypoints(root), [
      "supabase/functions/a/index.ts",
      "supabase/functions/b/index.ts",
    ]);
  } finally {
    cleanup();
  }
});

test("main() com --help retorna 0 sem exigir baseline", () => {
  assert.equal(main(["--help"]), 0);
});

test("main() falha (2) quando o arquivo de saida nao existe", () => {
  const exitCode = main([
    "--output",
    "/nonexistent/deno-check-output-that-does-not-exist.txt",
    "--baseline",
    "/nonexistent/baseline-that-does-not-exist.json",
  ]);
  assert.equal(exitCode, 2);
});

test("main() compara contra o baseline e acusa erro novo (exit 1)", () => {
  const { root, cleanup } = fixture();
  try {
    const outputPath = path.join(root, "deno-check.txt");
    writeFileSync(outputPath, SAMPLE_OUTPUT, "utf8");
    const baselinePath = path.join(root, "deno-check-baseline.json");
    writeFileSync(
      baselinePath,
      `${JSON.stringify(createBaseline(SAMPLE_OUTPUT, root), null, 2)}\n`,
      "utf8"
    );

    const limpo = captureConsole(() =>
      main(["--output", outputPath, "--baseline", baselinePath, "--root", root])
    );
    assert.equal(limpo.exitCode, 0);
    assert.ok(limpo.logs.some((line) => /OK: nenhum novo erro/u.test(line)));

    writeFileSync(
      baselinePath,
      `${JSON.stringify({ schemaVersion: 1, command: "deno check", issues: [] }, null, 2)}\n`,
      "utf8"
    );
    const sujo = captureConsole(() =>
      main(["--output", outputPath, "--baseline", baselinePath, "--root", root])
    );
    assert.equal(sujo.exitCode, 1);
    assert.ok(sujo.errors.some((line) => /TS18046/u.test(line)));
  } finally {
    cleanup();
  }
});

test("main() falha (2) e nao sobrescreve o baseline quando a saida esta incoerente", () => {
  const { root, cleanup } = fixture();
  try {
    const outputPath = path.join(root, "deno-check.txt");
    // Cabecalho de diagnostico sem a ancora "at file://..." — arquivo truncado.
    // Sem processo do deno nao ha exit code para conferir, mas a coerencia da
    // saida ainda barra: nada de gravar baseline a partir de saida cortada.
    writeFileSync(
      outputPath,
      "TS2322 [ERROR]: Type 'string' is not assignable to type 'number'.\n",
      "utf8"
    );
    const baselinePath = path.join(root, "deno-check-baseline.json");
    const original = `${JSON.stringify({ schemaVersion: 1, command: "deno check", issues: [] }, null, 2)}\n`;
    writeFileSync(baselinePath, original, "utf8");

    const { exitCode, errors } = captureConsole(() =>
      main([
        "--update-baseline",
        "--output",
        outputPath,
        "--baseline",
        baselinePath,
        "--root",
        root,
      ])
    );

    assert.equal(exitCode, 2);
    assert.equal(readFileSync(baselinePath, "utf8"), original, "baseline nao pode ser sobrescrito");
    assert.ok(errors.some((line) => /ERRO no deno check ratchet/u.test(line)));
  } finally {
    cleanup();
  }
});

test("describeOutput mostra a cauda de uma falha longa (motivo real da CLI)", () => {
  const linhas = [];
  for (let i = 1; i <= 40; i += 1) linhas.push(`Download https://esm.sh/pacote-${i}`);
  linhas.push("error: Failed to fetch https://esm.sh/@supabase/supabase-js@2.119.2");

  const texto = describeOutput(linhas.join("\n"));
  assert.ok(/\d+ linhas omitidas/u.test(texto), "saida longa precisa indicar o corte");
  assert.ok(/Failed to fetch/u.test(texto), "o motivo da falha esta no fim e nao pode ser cortado");
});

test("describeOutput devolve a saida curta inteira", () => {
  assert.equal(describeOutput('error: Module not found "x".\n'), 'error: Module not found "x".');
  assert.equal(describeOutput(""), "(saida vazia)");
});

test("runDenoWithAttempts repete a execucao quando o deno nao produz diagnostico", () => {
  const respostas = [
    { status: 1, output: "Download https://esm.sh/x\nerror: 429 Too Many Requests\n" },
    { status: 1, output: SAMPLE_OUTPUT },
  ];
  let chamadas = 0;
  const resultado = runDenoWithAttempts(() => respostas[chamadas++], ROOT, { onRetry: () => {} });

  assert.equal(chamadas, 2, "a primeira falha sem diagnostico deve ser repetida");
  assert.equal(resultado, SAMPLE_OUTPUT);
});

test("runDenoWithAttempts desiste depois das tentativas e expoe a cauda", () => {
  let chamadas = 0;
  assert.throws(
    () =>
      runDenoWithAttempts(
        () => {
          chamadas += 1;
          return { status: 1, output: "Download https://esm.sh/x\nerror: 429 Too Many Requests\n" };
        },
        ROOT,
        { attempts: 2, onRetry: () => {} }
      ),
    /429 Too Many Requests/u
  );
  assert.equal(chamadas, 2, "nao pode repetir sem limite");
});

test("runDenoWithAttempts nao repete quando existe diagnostico de tipo", () => {
  const incoerente = SAMPLE_OUTPUT.replace("Found 2 errors.", "Found 3 errors.");
  let chamadas = 0;
  assert.throws(
    () =>
      runDenoWithAttempts(
        () => {
          chamadas += 1;
          return { status: 1, output: incoerente };
        },
        ROOT,
        { onRetry: () => {} }
      ),
    /Found 3 errors/u
  );
  assert.equal(chamadas, 1, "diagnostico presente nao e falha de rede: nao repete");
});

test("runDenoWithAttempts nao repete exit inesperado", () => {
  let chamadas = 0;
  assert.throws(
    () =>
      runDenoWithAttempts(
        () => {
          chamadas += 1;
          return { status: 2, output: "error: flag desconhecida\n" };
        },
        ROOT,
        { onRetry: () => {} }
      ),
    /exit 2/u
  );
  assert.equal(chamadas, 1);
});
