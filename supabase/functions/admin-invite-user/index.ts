import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rateLimiting.ts";
import { callerCompanyId, requireUserOrServiceRole } from "../_shared/auth.ts";

// Convite de usuario (tela /admin/users/invite -> InviteUserPage -> useInviteUser).
//
// Antes nao existia convite: `useInviteUser` em src/hooks/useUsers.ts era um stub
// que devolvia `{ email, role }` sem chamar nada e o botao "Convidar" apontava para
// a rota /users/invite, que nao existia (404). Aqui o convite e de verdade:
//   1. `auth.admin.inviteUserByEmail` cria o login e envia o link;
//   2. `user_roles` recebe o papel escolhido (e por esta tabela que o app autoriza);
//   3. `user_companies` vincula o convidado a empresa de quem convidou.
// Se o passo 2 ou 3 falhar, o login recem-criado e apagado (rollback), para nao
// deixar usuario sem papel e sem empresa.
//
// O e-mail so sai com SMTP configurado no projeto Supabase; quando nao esta, o
// `inviteUserByEmail` falha e a mensagem real e devolvida para a tela.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valores aceitos em `user_roles.role`: uniao do enum criado pelas migrations
// (admin, user) com os que o banco de producao mostra no types.ts gerado
// (admin, user, Admin, Analyst, Manager, User). AuthProvider/AdminGuard aceitam
// 'admin' e 'Admin'.
const VALID_ROLES = ["user", "admin", "Admin", "Analyst", "Manager", "User"] as const;

const InviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(VALID_ROLES).optional(),
  full_name: z.string().trim().min(1).max(120).optional(),
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
    const rateLimitResult = await checkRateLimit(clientIP, "admin-invite-user", 5, 60);
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

    const payload = InviteSchema.safeParse(await req.json().catch(() => null));
    if (!payload.success) {
      return respond({ error: "Invalid payload", details: payload.error.flatten() }, 400);
    }

    const email = payload.data.email;
    const role = payload.data.role ?? "user";

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

    const isAdmin = (callerRoles ?? []).some(
      (row: { role: string }) => row.role === "admin" || row.role === "Admin"
    );
    if (!isAdmin) {
      return respond({ error: "Apenas admin pode convidar usuario" }, 403);
    }

    const companyId = await callerCompanyId(admin, { user, isServiceRole: false });
    if (!companyId) {
      return respond({ error: "Voce nao esta vinculado a uma empresa" }, 400);
    }

    const siteUrl = (Deno.env.get("SITE_URL") || "https://sentinela-v2.vercel.app").replace(
      /\/$/,
      ""
    );

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      // /reset-password ja consome a sessao que o link abre e troca a senha.
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (inviteError || !invited?.user) {
      const message = inviteError?.message ?? "Falha ao convidar";
      const duplicated = /already|registered|exists/i.test(message);
      return respond(
        {
          error: duplicated
            ? "Ja existe um usuario com este e-mail"
            : `Falha ao enviar o convite: ${message}`,
        },
        duplicated ? 409 : 500
      );
    }

    const invitedId = invited.user.id;

    const { error: roleInsertError } = await admin
      .from("user_roles")
      .insert({ user_id: invitedId, role });

    if (roleInsertError) {
      await admin.auth.admin.deleteUser(invitedId);
      return respond({ error: `Falha ao definir o papel: ${roleInsertError.message}` }, 500);
    }

    const { error: linkError } = await admin
      .from("user_companies")
      .insert({ user_id: invitedId, company_id: companyId });

    if (linkError) {
      await admin.auth.admin.deleteUser(invitedId);
      return respond({ error: `Falha ao vincular a empresa: ${linkError.message}` }, 500);
    }

    if (payload.data.full_name) {
      // Nome e cosmetico: o perfil ja existe (o e-mail veio do convite), entao a
      // falha aqui nao desfaz o convite.
      await admin
        .from("profiles")
        .update({ full_name: payload.data.full_name })
        .eq("id", invitedId);
    }

    return respond({
      success: true,
      user_id: invitedId,
      email,
      role,
      company_id: companyId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message.includes("authorization") || message.includes("token") ? 401 : 500;
    return respond({ error: message }, status);
  }
});
