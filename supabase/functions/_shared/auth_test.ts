import { assertEquals, assertRejects } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import {
  callerCompanyScope,
  companyScope,
  requireServiceRole,
  requireUserOrServiceRole,
  withCompanyScope,
} from "./auth.ts";

const SERVICE_KEY = "service-role-key-de-teste";

function req(headers: Record<string, string>) {
  return new Request("https://example.test/functions/v1/_gate", { method: "POST", headers });
}

Deno.test("requireUserOrServiceRole - sem Authorization lanca", async () => {
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
  await assertRejects(() => requireUserOrServiceRole(req({ apikey: "chave-publicavel" })));
});

Deno.test("requireUserOrServiceRole - service_role passa como interno", async () => {
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
  const ctx = await requireUserOrServiceRole(req({ Authorization: `Bearer ${SERVICE_KEY}` }));
  assertEquals(ctx.isServiceRole, true);
  assertEquals(ctx.user, null);
});

Deno.test("requireUserOrServiceRole - service_role tambem passa via apikey", async () => {
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
  const ctx = await requireUserOrServiceRole(req({ apikey: SERVICE_KEY }));
  assertEquals(ctx.isServiceRole, true);
  assertEquals(ctx.user, null);
});

Deno.test(
  "requireUserOrServiceRole - chave publicavel nao e confundida com service_role",
  async () => {
    Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
    Deno.env.set("SUPABASE_URL", "https://project-inexistente.invalid");
    await assertRejects(() =>
      requireUserOrServiceRole(
        req({ apikey: "chave-publicavel", Authorization: "Bearer chave-publicavel" })
      )
    );
  }
);

Deno.test(
  "requireUserOrServiceRole - sem service_role configurada nao aceita token vazio",
  async () => {
    Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "");
    await assertRejects(() => requireUserOrServiceRole(req({ Authorization: "Bearer " })));
  }
);

Deno.test("requireServiceRole - service_role via Authorization passa", async () => {
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
  const ctx = await requireServiceRole(req({ Authorization: `Bearer ${SERVICE_KEY}` }));
  assertEquals(ctx.isServiceRole, true);
});

Deno.test("requireServiceRole - service_role via apikey passa", async () => {
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
  const ctx = await requireServiceRole(req({ apikey: SERVICE_KEY }));
  assertEquals(ctx.isServiceRole, true);
});

Deno.test("requireServiceRole - chave publicavel do front e recusada", async () => {
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);
  Deno.env.set("SUPABASE_URL", "https://project-inexistente.invalid");
  await assertRejects(() =>
    requireServiceRole(
      req({ apikey: "sb_publishable_front", Authorization: "Bearer sb_publishable_front" })
    )
  );
});

Deno.test("requireServiceRole - sem credencial nenhuma recusa", async () => {
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "");
  Deno.env.set("SUPABASE_URL", "https://project-inexistente.invalid");
  await assertRejects(() => requireServiceRole(req({})));
});

Deno.test("companyScope - com empresa libera a empresa e as linhas globais", () => {
  assertEquals(companyScope("empresa-1"), "company_id.is.null,company_id.eq.empresa-1");
});

Deno.test("companyScope - sem empresa libera apenas as linhas globais", () => {
  assertEquals(companyScope(null), "company_id.is.null");
  assertEquals(companyScope(undefined), "company_id.is.null");
  assertEquals(companyScope(""), "company_id.is.null");
});

Deno.test("withCompanyScope - chamador interno nao recebe filtro", () => {
  const query = { or: () => "filtrado" };
  assertEquals(withCompanyScope(query, null), query);
});

Deno.test("withCompanyScope - aplica o filtro de empresa no builder", () => {
  const query = { or: (filter: string) => `or(${filter})` };
  const resultado: unknown = withCompanyScope(query, "company_id.is.null,company_id.eq.empresa-1");

  assertEquals(resultado, "or(company_id.is.null,company_id.eq.empresa-1)");
});

Deno.test("callerCompanyScope - service_role varre todas as empresas", async () => {
  const admin = {
    rpc: () => {
      throw new Error("nao deve consultar a empresa do chamador");
    },
  };
  assertEquals(await callerCompanyScope(admin, { user: null, isServiceRole: true }), null);
});

Deno.test("callerCompanyScope - usuario logado filtra pela empresa dele", async () => {
  const chamadas: { fn: string; args?: Record<string, unknown> }[] = [];
  const admin = {
    rpc: (fn: string, args?: Record<string, unknown>) => {
      chamadas.push({ fn, args });
      return Promise.resolve({ data: "empresa-9", error: null });
    },
  };

  assertEquals(
    await callerCompanyScope(admin, { user: { id: "user-1" }, isServiceRole: false }),
    "company_id.is.null,company_id.eq.empresa-9"
  );
  assertEquals(chamadas, [{ fn: "get_user_company_id", args: { _user_id: "user-1" } }]);
});

Deno.test("callerCompanyScope - usuario sem empresa nao ve dados de terceiros", async () => {
  const admin = { rpc: () => Promise.resolve({ data: null, error: null }) };
  assertEquals(
    await callerCompanyScope(admin, { user: { id: "user-2" }, isServiceRole: false }),
    "company_id.is.null"
  );
});
