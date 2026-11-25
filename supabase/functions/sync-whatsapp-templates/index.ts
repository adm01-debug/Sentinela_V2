import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { checkRateLimit } from "../_shared/rateLimiting.ts";

interface MetaTemplate {
  id: string;
  name: string;
  language?: string;
  status?: string;
  category?: string;
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const address = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = await checkRateLimit(address, "sync-whatsapp-templates", 10, 60);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let user;
    try {
      user = await verifyAuth(req);
    } catch {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // whatsapp_config e whatsapp_templates sao admin-only na RLS e a pagina so
    // mostra dados para admin; sem este gate qualquer usuario logado reescrevia
    // os templates globais da conta Meta da empresa.
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "super_admin"]);
    if (rolesError || !roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Credenciais da integração lidas da tabela whatsapp_config (se acess_token
    // não estiver em env), ou das env vars padrão das demais functions.
    const envToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const envPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    let accessToken = envToken ?? "";
    let phoneNumberId = envPhoneNumberId ?? "";

    if (!accessToken || !phoneNumberId) {
      const { data: cfg, error: cfgErr } = await supabase
        .from("whatsapp_config")
        .select("phone_number_id, access_token")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (cfgErr) throw cfgErr;
      if (cfg) {
        accessToken = cfg.access_token ?? accessToken;
        phoneNumberId = cfg.phone_number_id ?? phoneNumberId;
      }
    }

    if (!accessToken || !phoneNumberId) {
      return new Response(JSON.stringify({ error: "WhatsApp API not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/message_templates?limit=100`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const result = await response.json();
    if (!response.ok) {
      const msg = result?.error?.message || "Failed to fetch templates from Meta";
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const templates: MetaTemplate[] = result?.data ?? [];
    let upserted = 0;
    let failed = 0;

    for (const t of templates) {
      const { error } = await supabase.from("whatsapp_templates").upsert(
        {
          template_id: t.id,
          name: t.name,
          language: t.language ?? "pt_BR",
          status: t.status ?? "pending",
          category: t.category ?? null,
        },
        { onConflict: "template_id" }
      );
      if (error) failed += 1;
      else upserted += 1;
    }

    return new Response(
      JSON.stringify({ success: true, fetched: templates.length, upserted, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
