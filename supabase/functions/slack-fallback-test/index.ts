import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

/** Extrai apenas a primeira linha da mensagem de erro, evitando vazar stack traces. */
function safeError(e: unknown, max = 200): string {
  const raw = e instanceof Error ? e.message : String(e);
  const firstLine = raw.split("\n")[0]?.trim() ?? "";
  return firstLine.slice(0, max) || "unknown_error";
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Parse mode do body (chaos engineering) — default 'real'
    type ChaosMode = "real" | "timeout" | "error_429" | "error_500" | "partial_failure";
    let mode: ChaosMode = "real";
    if (req.method !== "GET") {
      try {
        const bodyJson = await req.json().catch(() => ({}));
        const requested = (bodyJson?.mode ?? "real") as string;
        if (["real", "timeout", "error_429", "error_500", "partial_failure"].includes(requested)) {
          mode = requested as ChaosMode;
        }
      } catch {
        /* noop */
      }
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: máx 5 testes / 10min por admin (previne abuso e custo Resend)
    const { data: rl } = await supabase.rpc("check_rate_limit", {
      p_identifier: userData.user.id,
      p_identifier_type: "user",
      p_endpoint: "slack-fallback-test",
      p_max_requests: 5,
      p_window_seconds: 600,
    });
    const rateLimit = rl as { allowed: boolean; retry_after_seconds?: number } | null;
    if (rateLimit && !rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "rate_limited",
          message: "Limite de 5 testes a cada 10 minutos atingido",
          retry_after_seconds: rateLimit.retry_after_seconds,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateLimit.retry_after_seconds ?? 600),
          },
        }
      );
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey && mode === "real") {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured", configured: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: settings } = await supabase
      .from("alert_notification_settings")
      .select("recipient_emails, enabled")
      .eq("setting_type", "slack_fallback")
      .maybeSingle();

    if (!settings || !settings.enabled) {
      return new Response(JSON.stringify({ error: "Fallback desabilitado nas configurações" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipients = (settings.recipient_emails ?? []) as string[];
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum destinatário configurado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "SecureWatch <alerts@securewatch.app>";
    const html = `
      <div style="font-family: system-ui, sans-serif; padding: 24px; background: #f9fafb;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 8px; padding: 24px;">
          <h2 style="margin: 0 0 12px; color: #111827;">Teste de Fallback Resend</h2>
          <p style="color: #4b5563;">
            Este é um <b>e-mail de teste</b> disparado manualmente do painel de auditoria.
            Se você recebeu esta mensagem, o fallback via Resend está funcionando corretamente.
          </p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
            Disparado por: ${userData.user.email} · ${new Date().toISOString()}
          </p>
        </div>
      </div>
    `;

    // Dispatcher com injeção de falhas para prever gaps do sistema
    let emailStatus = 0;
    let emailOk = false;
    let body = "";
    let resendId: string | null = null;
    let perRecipient: Array<{ email: string; delivered: boolean; error?: string }> | null = null;

    if (mode === "timeout") {
      // Simula latência acima do orçamento (~8s) sem chamar Resend
      await new Promise((r) => setTimeout(r, 8000));
      emailStatus = 408;
      body = JSON.stringify({ simulated: true, reason: "timeout" });
    } else if (mode === "error_429") {
      emailStatus = 429;
      body = JSON.stringify({ simulated: true, reason: "rate_limited", retry_after: 30 });
    } else if (mode === "error_500") {
      emailStatus = 500;
      body = JSON.stringify({ simulated: true, reason: "upstream_provider_error" });
    } else if (mode === "partial_failure") {
      // Metade entrega, metade falha (simula bounce/reject por destinatário)
      const half = Math.max(1, Math.floor(recipients.length / 2));
      perRecipient = recipients.map((email, i) => ({
        email,
        delivered: i < half,
        error: i < half ? undefined : "invalid_recipient",
      }));
      const delivered = perRecipient.filter((r) => r.delivered).length;
      emailOk = delivered > 0;
      emailStatus = emailOk ? 207 : 502; // 207 Multi-Status
      body = JSON.stringify({ simulated: true, delivered, failed: recipients.length - delivered });
    } else {
      // Modo real
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: recipients,
          subject: "[TESTE] Fallback Resend - SecureWatch",
          html,
        }),
      });
      body = await emailRes.text();
      emailStatus = emailRes.status;
      emailOk = emailRes.ok;
      try {
        resendId = (JSON.parse(body) as { id?: string }).id ?? null;
      } catch {
        /* noop */
      }
    }

    const success = mode === "real" ? emailOk : mode === "partial_failure" && emailOk;

    // Auditoria — persiste em edge_function_logs para o card de histórico
    await supabase.from("edge_function_logs").insert({
      function_name: "slack-fallback-test",
      status: success ? "success" : "error",
      metadata: {
        triggered_by: userData.user.email,
        user_id: userData.user.id,
        mode,
        simulated: mode !== "real",
        recipients_count: recipients.length,
        recipients,
        per_recipient: perRecipient,
        resend_status: emailStatus,
        resend_id: resendId,
        error: success ? null : body.slice(0, 500),
      },
    });

    if (!success) {
      return new Response(
        JSON.stringify({
          error: mode === "real" ? "Falha no envio" : `Chaos [${mode}] simulou falha`,
          mode,
          simulated: mode !== "real",
          status: emailStatus,
          per_recipient: perRecipient,
          details: body,
        }),
        { status: emailStatus, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        simulated: mode !== "real",
        recipients: recipients.length,
        per_recipient: perRecipient,
        resend_id: resendId,
        message:
          mode === "real"
            ? `Teste enviado para ${recipients.length} destinatário(s)`
            : `Chaos [${mode}] executado — verifique o histórico`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: safeError(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
