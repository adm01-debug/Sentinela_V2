import { assertEquals, assertRejects } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { requireServiceRole, requireUserOrServiceRole } from "./auth.ts";

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
