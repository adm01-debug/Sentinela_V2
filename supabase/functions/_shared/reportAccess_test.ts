import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { canAccessReport } from "./reportAccess.ts";

function ctx(over: Partial<Parameters<typeof canAccessReport>[0]> = {}) {
  return {
    isServiceRole: false,
    callerUserId: "usuario-1",
    isAdmin: false,
    callerCompanyId: "empresa-1",
    requestedBy: "usuario-1",
    requesterCompanyId: "empresa-1",
    ...over,
  };
}

Deno.test("canAccessReport - service_role (cron/interno) passa por qualquer relatorio", () => {
  assertEquals(
    canAccessReport(
      ctx({
        isServiceRole: true,
        callerUserId: null,
        requestedBy: "de-outra-empresa",
        requesterCompanyId: "empresa-2",
      })
    ),
    true
  );
});

Deno.test("canAccessReport - solicitante acessa o proprio relatorio", () => {
  assertEquals(canAccessReport(ctx()), true);
});

Deno.test("canAccessReport - usuario comum nao acessa relatorio de terceiro", () => {
  assertEquals(
    canAccessReport(ctx({ requestedBy: "usuario-2", requesterCompanyId: "empresa-1" })),
    false
  );
});

Deno.test("canAccessReport - admin nao acessa relatorio de outra empresa", () => {
  assertEquals(
    canAccessReport(
      ctx({ isAdmin: true, requestedBy: "usuario-2", requesterCompanyId: "empresa-2" })
    ),
    false
  );
});

Deno.test("canAccessReport - admin da mesma empresa acessa relatorio de colega", () => {
  assertEquals(
    canAccessReport(
      ctx({ isAdmin: true, requestedBy: "usuario-2", requesterCompanyId: "empresa-1" })
    ),
    true
  );
});

Deno.test("canAccessReport - admin cuida de relatorio orfao (solicitante removido)", () => {
  assertEquals(
    canAccessReport(ctx({ isAdmin: true, requestedBy: null, requesterCompanyId: null })),
    true
  );
});

Deno.test("canAccessReport - sem usuario identificado nao passa", () => {
  assertEquals(canAccessReport(ctx({ callerUserId: null, isAdmin: true })), false);
});

Deno.test("canAccessReport - admin sem empresa nao pega relatorio de outra empresa", () => {
  assertEquals(
    canAccessReport(
      ctx({
        isAdmin: true,
        callerCompanyId: null,
        requestedBy: "usuario-2",
        requesterCompanyId: "empresa-2",
      })
    ),
    false
  );
});
