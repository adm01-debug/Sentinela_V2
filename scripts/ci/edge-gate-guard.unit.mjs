import assert from "node:assert/strict";
import test from "node:test";
import { analyze, detectGate, parseConfigFunctions } from "./edge-gate-guard.mjs";

const CONFIG = `[functions.gated]
verify_jwt = true

[functions.legacy]
verify_jwt = true
`;

test("detectGate ignora checagem de presenca do header", () => {
  const source = `
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(null, { status: 401 });
  `;
  assert.deepEqual(detectGate(source), []);
});

test("detectGate reconhece os gates usados no repositorio", () => {
  assert.deepEqual(detectGate("await requireServiceRole(req);"), ["requireServiceRole"]);
  assert.deepEqual(detectGate("await requireUserOrServiceRole(req);"), [
    "requireUserOrServiceRole",
  ]);
  assert.deepEqual(detectGate("await requireCronOrServiceRole(req, 'job');"), [
    "requireCronOrServiceRole",
  ]);
  assert.deepEqual(detectGate("await verifyAuth(req);"), ["verifyAuth"]);
  assert.deepEqual(detectGate("const { data } = await client.auth.getUser(token);"), [
    "auth.getUser",
  ]);
  assert.deepEqual(detectGate("await fetch(`${url}/auth/v1/user`)"), ["auth/v1/user"]);
  assert.deepEqual(detectGate("await admin.rpc('has_role', { _role: 'admin' })"), ["has_role"]);
  assert.deepEqual(detectGate("await supabase.from('agent_keys').select()"), ["agent_keys"]);
});

test("funcao sem gate falha e excecao com motivo suprime", () => {
  const functions = [
    { name: "gated", source: "await requireServiceRole(req);" },
    { name: "legacy", source: "if (!authHeader) return 401;" },
  ];
  const withoutException = analyze({ functions, configText: CONFIG, baseline: { exceptions: [] } });
  assert.deepEqual(withoutException.ungated, ["legacy"]);

  const withException = analyze({
    functions,
    configText: CONFIG,
    baseline: { exceptions: [{ function: "legacy", reason: "publico por desenho" }] },
  });
  assert.deepEqual(withException.ungated, []);
  assert.deepEqual(withException.suppressed, ["legacy"]);
  assert.deepEqual(withException.pendingReason, []);
});

test("excecao sem motivo escrito falha", () => {
  const functions = [{ name: "legacy", source: "if (!authHeader) return 401;" }];
  const pending = analyze({
    functions,
    configText: CONFIG,
    baseline: { exceptions: [{ function: "legacy", reason: "PENDENTE: justifique" }] },
  });
  assert.deepEqual(pending.pendingReason, ["legacy"]);
});

test("cobranca do config.toml: entrada ausente e entrada orfa", () => {
  const functions = [
    { name: "gated", source: "await requireServiceRole(req);" },
    { name: "orphan", source: "await requireServiceRole(req);" },
  ];
  const result = analyze({ functions, configText: CONFIG, baseline: { exceptions: [] } });
  assert.deepEqual(result.missingConfig, ["orphan"]);
  assert.deepEqual(result.orphanConfig, ["legacy"]);
  assert.deepEqual(result.noVerifyJwt, []);
});

test("entrada sem verify_jwt explicito falha", () => {
  const functions = [{ name: "gated", source: "await requireServiceRole(req);" }];
  const result = analyze({
    functions,
    configText: "[functions.gated]\n",
    baseline: { exceptions: [] },
  });
  assert.deepEqual(result.noVerifyJwt, ["gated"]);
});

test("excecao paga (funcao ganhou gate) sai do baseline", () => {
  const functions = [{ name: "legacy", source: "await requireServiceRole(req);" }];
  const result = analyze({
    functions,
    configText: CONFIG,
    baseline: { exceptions: [{ function: "legacy", reason: "antiga" }] },
  });
  assert.deepEqual(result.paid, ["legacy"]);
});

test("parseConfigFunctions le verify_jwt de cada bloco", () => {
  const entries = parseConfigFunctions(CONFIG);
  assert.deepEqual(entries, [
    { name: "gated", hasVerifyJwt: true },
    { name: "legacy", hasVerifyJwt: true },
  ]);
  assert.deepEqual(parseConfigFunctions("[functions.sem_flag]\nenabled = true\n"), [
    { name: "sem_flag", hasVerifyJwt: false },
  ]);
});
