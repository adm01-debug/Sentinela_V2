import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rateLimiting.ts";
import { callerCompanyId, requireUserOrServiceRole } from "../_shared/auth.ts";

// Remocao de usuario da conta (tela /users, `UsersPage` -> `useDeleteUser`).
//
// Antes o front apagava a linha de `profiles` direto pelo PostgREST e nao havia
// policy de DELETE: o PostgREST apagava 0 linhas sem erro e a tela anunciava
// "Usuario removido". Pior: apagar so `profiles` nao tira o acesso, porque o
// login vive em `auth.users` e o app autentica por `auth.users` + `user_roles`.
//
// Aqui a remocao e de verdade: `auth.admin.deleteUser` apaga o login e o
// cascade de `profiles.id`/`user_roles.user_id` (ambos
// `REFERENCES auth.users(id) ON DELETE CASCADE`) limpa o resto. `user_companies`
// nao tem FK para `auth.users`, entao e apagada na mao.
//
// Quem pode: admin (`user_roles`) da mesma empresa do alvo. Ninguem remove a si
// mesmo por aqui.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RemoveSchema = z.object({
  user_id: z.string().uuid(),
});

serve(async (req) => {
  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimitResult = await checkRateLimit(clientIP, "admin-remove-user", 5, 60);
    if (!rateLimitResult.allowed) {
      return respond(
        { error: "Rate limit exceeded", retry_after: rateLimitResult.retryAfter },
        429
      );
    }

    const { user } = await requireUserOrServiceRole(req);
    if (!user) {
      return respond({ error: "Unauthorized" }, 401);
    }

    const payload = RemoveSchema.safeParse(await req.json().catch(() => null));
    if (!payload.success) {
      return respond({ error: "Invalid payload", details: payload.error.flatten() }, 400);
    }
    const targetId = payload.data.user_id;

    if (targetId === user.id) {
      return respond({ error: "Nao e possivel remover o proprio usuario" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: callerRoles, error: rolesError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError) {
      return respond({ error: "Falha ao validar permissao" }, 500);
    }

    // `user_roles.role` guarda mais valores que a migration original (o tipo
    // gerado em src/integrations/supabase/types.ts lista admin, user, Admin,
    // Analyst, Manager, User) e o AdminGuard aceita 'admin' e 'Admin'.
    const isAdmin = (callerRoles ?? []).some(
      (row: { role: string }) => row.role === "admin" || row.role === "Admin"
    );
    if (!isAdmin) {
      return respond({ error: "Apenas admin pode remover usuario" }, 403);
    }

    const callerCompany = await callerCompanyId(admin, { user, isServiceRole: false });

    const { data: targetLinks, error: linkError } = await admin
      .from("user_companies")
      .select("company_id")
      .eq("user_id", targetId);

    if (linkError) {
      return respond({ error: "Falha ao consultar o usuario" }, 500);
    }

    const companies = (targetLinks ?? []).map((row: { company_id: string }) => row.company_id);
    if (!companies.length) {
      return respond({ error: "Usuario nao encontrado" }, 404);
    }
    if (callerCompany && !companies.includes(callerCompany)) {
      return respond({ error: "Usuario de outra empresa" }, 403);
    }

    const { error: unlinkError } = await admin
      .from("user_companies")
      .delete()
      .eq("user_id", targetId);
    if (unlinkError) {
      return respond({ error: "Falha ao desvincular empresa" }, 500);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(targetId);
    if (deleteError) {
      return respond({ error: deleteError.message }, 500);
    }

    return respond({ success: true, removed_user_id: targetId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message.includes("authorization") || message.includes("token") ? 401 : 500;
    return respond({ error: message }, status);
  }
});
