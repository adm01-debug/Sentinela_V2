import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";

// Contrato estatico da edge `delete-user-data` (LGPD - direito ao esquecimento).
//
// Esta edge ja foi removida do repo uma vez porque nada provava o que ela fazia
// (e o gate antigo exigia service_role, que o front nunca tem). Os testes abaixo
// leem o fonte da edge e o schema tipado para impedir que ela volte a ser
// inalcancavel, que perca a confirmacao pelo nome ou que passe a apagar tabela
// que nao existe.

const EDGE = new URL("./index.ts", import.meta.url);
const TYPES = new URL("../../../src/integrations/supabase/types.ts", import.meta.url);

async function fonteEdge(): Promise<string> {
  return await Deno.readTextFile(EDGE);
}

/** Extrai os itens de um array `const NOME = [ "a", "b" ]` do fonte. */
function listaConstante(fonte: string, nome: string): string[] {
  const bloco = fonte.match(new RegExp(`const ${nome} = \\[([\\s\\S]*?)\\];`));
  assert(bloco, `lista ${nome} nao encontrada na edge`);
  return [...bloco[1].matchAll(/"([a-z_]+)"/g)].map((m) => m[1]);
}

Deno.test(
  "delete-user-data - caminho executavel pelo front: autentica sem exigir service_role",
  async () => {
    const fonte = await fonteEdge();
    assertStringIncludes(fonte, "requireUserOrServiceRole(req)");
    assertEquals(
      /requireServiceRole\(/.test(fonte),
      false,
      "o front nunca tem service_role: exigir essa credencial torna a edge morta"
    );
  }
);

Deno.test("delete-user-data - exige admin validado em user_roles", async () => {
  const fonte = await fonteEdge();
  assertStringIncludes(fonte, '.from("user_roles")');
  assertStringIncludes(fonte, '"admin"');
  assertStringIncludes(fonte, "Apenas admin pode excluir dados de titular");
});

Deno.test("delete-user-data - bloqueia funcionario de outra empresa", async () => {
  const fonte = await fonteEdge();
  assertStringIncludes(fonte, "callerCompanyId(admin");
  assertStringIncludes(fonte, "Funcionario de outra empresa");
});

Deno.test("delete-user-data - exclusao so roda com confirmacao do nome", async () => {
  const fonte = await fonteEdge();
  assertEquals(/confirm_name: z\.string\(\)\.min\(1\)/.test(fonte), true);
  assertStringIncludes(fonte, "Confirmacao invalida");
  // A validacao acontece somente fora do dry_run.
  assertEquals(/if \(!dryRun\) \{\s*const typed/.test(fonte), true);
});

Deno.test("delete-user-data - dry_run devolve contagem por tabela e nao apaga", async () => {
  const fonte = await fonteEdge();
  assertStringIncludes(fonte, 'count: "exact"');
  assertStringIncludes(fonte, "total_rows");
  const dryRunBlock = fonte.slice(fonte.indexOf("if (dryRun) {"), fonte.indexOf("const results:"));
  assert(dryRunBlock.includes("counts"), "dry_run precisa devolver counts");
  assertEquals(dryRunBlock.includes(".delete()"), false, "dry_run nao pode apagar");
});

Deno.test("delete-user-data - registra a exclusao em audit_logs", async () => {
  const fonte = await fonteEdge();
  const auditoria = fonte.match(/\.from\("audit_logs"\)\.insert\(([\s\S]*?)\}\);/);
  assert(auditoria, "exclusao sem registro em audit_logs");
  for (const campo of ["entity_id", "entity_name", "module", "severity", "user_id", "new_values"]) {
    assertStringIncludes(auditoria[1], campo);
  }
});

Deno.test("delete-user-data - toda tabela apagada existe no schema tipado", async () => {
  const fonte = await fonteEdge();
  const tipos = await Deno.readTextFile(TYPES);
  const tabelas = [...listaConstante(fonte, "BY_NAME"), ...listaConstante(fonte, "BY_ID")];

  assert(tabelas.length >= 15, `esperava ao menos 15 tabelas, achei ${tabelas.length}`);
  assertEquals(new Set(tabelas).size, tabelas.length, "tabela repetida na lista de exclusao");
  assertEquals(
    tabelas.at(-1),
    "employees",
    "employees precisa ser a ultima: apagar antes quebra as FKs das demais"
  );

  for (const tabela of tabelas) {
    assert(
      tipos.includes(`\n      ${tabela}: {`),
      `tabela ${tabela} nao existe em src/integrations/supabase/types.ts`
    );
  }
});

Deno.test("delete-user-data - nome, coluna e escopo de cada alvo sao coerentes", async () => {
  const fonte = await fonteEdge();
  const alvos = fonte.match(/const targets = \[[\s\S]*?\n {4}\];/);
  assert(alvos, "montagem de alvos nao encontrada");
  const bloco = alvos[0];
  assertStringIncludes(bloco, "employee_name");
  assertStringIncludes(bloco, "employeeName");
  assertStringIncludes(bloco, "employee_id");
  assertStringIncludes(bloco, 'table === "employees" ? "id" : "employee_id"');
});

Deno.test("delete-user-data - declarada no config.toml com verify_jwt explicito", async () => {
  const config = await Deno.readTextFile(new URL("../../config.toml", import.meta.url));
  assert(
    /\[functions\.delete-user-data\]\s*\nverify_jwt = true/.test(config),
    "entrada [functions.delete-user-data] ausente ou sem verify_jwt"
  );
});

Deno.test(
  "cors permite Authorization (sem isso o preflight bloqueia toda chamada com JWT)",
  async () => {
    const fonte = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
    const cors = fonte.match(/const corsHeaders = \{([\s\S]*?)\};/);
    assertEquals(!!cors, true, "corsHeaders nao encontrado");
    assertEquals(
      cors![1].includes("authorization"),
      true,
      "Access-Control-Allow-Headers precisa aceitar authorization"
    );
  }
);

Deno.test("preflight responde 200 com os cabecalhos de CORS", async () => {
  const fonte = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  assertEquals(
    /if \(req\.method === "OPTIONS"\) \{\s*return new Response\("ok", \{ headers: corsHeaders \}\)/.test(
      fonte
    ),
    true
  );
});
