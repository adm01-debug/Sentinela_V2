import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  auditarSegredos,
  classificar,
  extrairJson,
  funcoesNoRepo,
  papelDoJwt,
  redigir,
  referencias,
  rotular,
} from "./checar-cron.mjs";

const URL_BASE = "https://jgnmwvzephsozsqmcpzb.supabase.co/functions/v1";

function jwt(papel) {
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ role: papel })}.assinatura-falsa`;
}

function comando(nome) {
  return `select net.http_post(url := '${URL_BASE}/${nome}', headers := '{}'::jsonb, body := '{}'::jsonb)`;
}

test("extrairJson ignora a linha do wrapper de retry", () => {
  const bruto = '[{"jobid":1,"jobname":"a"}]\nOK na tentativa 1.\n';
  assert.deepEqual(extrairJson(bruto), [{ jobid: 1, jobname: "a" }]);
});

test("extrairJson devolve null quando a resposta nao tem JSON", () => {
  assert.equal(extrairJson("curl: (6) Could not resolve host"), null);
});

test("funcoesNoRepo le so os diretorios de supabase/functions", () => {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), "cron-"));
  fs.mkdirSync(path.join(raiz, "supabase/functions/existe"), { recursive: true });
  fs.writeFileSync(path.join(raiz, "supabase/functions/config.toml"), "");
  assert.deepEqual([...funcoesNoRepo(raiz)], ["existe"]);
});

test("referencias junta os jobs por funcao e ignora comando sem funcao", () => {
  const jobs = [
    { jobid: 1, jobname: "a", command: comando("expire-recordings") },
    { jobid: 2, jobname: "b", command: comando("expire-recordings") },
    { jobid: 3, jobname: "c", command: "select 1" },
  ];
  assert.deepEqual(referencias(jobs), [{ funcao: "expire-recordings", jobs: ["a", "b"] }]);
});

test("classificar separa o que saiu do repositorio", () => {
  const jobs = [
    { jobid: 1, jobname: "vivo", command: comando("expire-recordings") },
    { jobid: 2, jobname: "apagada", command: comando("daily-summary") },
  ];
  const { referenciadas, foraDoRepo } = classificar(jobs, new Set(["expire-recordings"]));
  assert.equal(referenciadas.length, 2);
  assert.deepEqual(
    foraDoRepo.map((ref) => ref.funcao),
    ["daily-summary"]
  );
});

test("rotular compara por nome, nao por identidade", () => {
  const refs = [
    { funcao: "expire-recordings", jobs: ["a"] },
    { funcao: "daily-summary", jobs: ["b"] },
  ];
  assert.deepEqual(
    rotular(refs, new Set(["expire-recordings"])).map((ref) => ref.onde),
    ["no repo", "fora do repo"]
  );
});

test("redigir troca o JWT inteiro, preservando o resto do comando", () => {
  const texto = `headers := '{"apikey":"${jwt("anon")}"}'::jsonb`;
  const saida = redigir(texto);
  assert.ok(!saida.includes(jwt("anon")));
  assert.ok(saida.includes("<REDIGIDO>"));
  assert.ok(saida.includes("headers :="));
});

test("papelDoJwt le o role do payload e devolve null quando nao e JWT", () => {
  assert.equal(papelDoJwt(jwt("service_role")), "service_role");
  assert.equal(papelDoJwt("nao-e-jwt"), null);
});

test("auditarSegredos separa chave publica de service_role", () => {
  const jobs = [
    { jobid: 1, jobname: "publica", command: `${comando("a")} -- apikey ${jwt("anon")}` },
    { jobid: 2, jobname: "grave", command: `${comando("b")} -- apikey ${jwt("service_role")}` },
    { jobid: 3, jobname: "texto", command: `${comando("c")} -- using service_role` },
    { jobid: 4, jobname: "limpo", command: comando("d") },
  ];
  const auditoria = auditarSegredos(jobs);
  assert.deepEqual(
    auditoria.map((item) => item.tokens),
    [1, 1, 0, 0]
  );
  assert.deepEqual(auditoria[1].papeis, ["service_role"]);
  assert.equal(auditoria[2].citaServiceRole, true);
  assert.deepEqual(
    auditoria.filter((item) => item.tokens > 0 || item.citaServiceRole).map((item) => item.jobname),
    ["publica", "grave", "texto"]
  );
});
