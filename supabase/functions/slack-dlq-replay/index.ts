/**
 * slack-dlq-replay
 * Reenvia uma mensagem previamente falha da fila slack_notification_dlq.
 * SÃƒÆ’Ã‚Â³ pode ser invocada por administradores autenticados.
 *
 * Body: { dlq_id: string, target_integration_id?: string }
 *   - Se target_integration_id for informado, tenta enviar para esse webhook.
 *   - Caso contrÃƒÆ’Ã‚Â¡rio usa o integration_id original (se ainda existir e estiver ativo).
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Extrai apenas a primeira linha da mensagem de erro, evitando vazar stack traces. */
function safeError(e: unknown, max = 200): string {
  const raw = e instanceof Error ? e.message : String(e);
  const firstLine = raw.split("\n")[0]?.trim() ?? "";
  return firstLine.slice(0, max) || "unknown_error";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const startedAt = Date.now();

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Valida o usuÃƒÆ’Ã‚Â¡rio via anon client + JWT do caller
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userRes, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userRes?.user) return json({ error: "unauthorized" }, 401);

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: isAdmin } = await admin.rpc("has_role", {
    _user_id: userRes.user.id,
    _role: "admin",
  });
  if (!isAdmin) return json({ error: "forbidden" }, 403);

  let body: { dlq_id?: string; target_integration_id?: string } | undefined;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const dlqId: string | undefined = body?.dlq_id;
  const overrideIntegration: string | undefined = body?.target_integration_id;
  if (!dlqId) return json({ error: "missing_dlq_id" }, 400);

  const { data: item, error: itemErr } = await admin
    .from("slack_notification_dlq")
    .select("*")
    .eq("id", dlqId)
    .maybeSingle();
  if (itemErr) return json({ error: safeError(itemErr) }, 500);
  if (!item) return json({ error: "not_found" }, 404);
  if (item.replayed_at && item.replay_success) {
    return json({ error: "already_replayed" }, 409);
  }

  const targetId = overrideIntegration ?? item.integration_id;
  if (!targetId) return json({ error: "no_target_integration" }, 400);

  const { data: integration, error: intErr } = await admin
    .from("slack_integrations")
    .select("id, name, webhook_url, is_active, auto_paused_at")
    .eq("id", targetId)
    .maybeSingle();
  if (intErr) return json({ error: safeError(intErr) }, 500);
  if (!integration) return json({ error: "integration_not_found" }, 404);
  if (!integration.is_active || integration.auto_paused_at) {
    return json(
      {
        error: "integration_inactive",
        hint: "Reative a integraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o antes de reenviar.",
      },
      409
    );
  }

  // Reconstroi o payload Slack Block Kit a partir do item da DLQ.
  const SEVERITY_EMOJI: Record<string, string> = {
    warning: ":warning:",
    critical: ":rotating_light:",
    breached: ":fire:",
  };
  const SEVERITY_COLOR: Record<string, string> = {
    warning: "#F5A524",
    critical: "#F31260",
    breached: "#7828C8",
  };
  const emoji = SEVERITY_EMOJI[item.severity] ?? ":bell:";
  const color = SEVERITY_COLOR[item.severity] ?? "#0EA5E9";
  const fields = (item.fields ?? {}) as Record<string, string>;
  const fieldBlocks = Object.entries(fields).map(([k, v]) => ({
    type: "mrkdwn",
    text: `*${k}:*\n${v}`,
  }));

  const payload = {
    text: `${emoji} [REPLAY] ${item.title}`,
    attachments: [
      {
        color,
        blocks: [
          { type: "header", text: { type: "plain_text", text: `${emoji} ${item.title}` } },
          { type: "section", text: { type: "mrkdwn", text: item.message } },
          ...(fieldBlocks.length > 0
            ? [{ type: "section", fields: fieldBlocks.slice(0, 10) }]
            : []),
          ...(item.url
            ? [
                {
                  type: "actions",
                  elements: [
                    {
                      type: "button",
                      text: { type: "plain_text", text: "Abrir no painel" },
                      url: item.url,
                    },
                  ],
                },
              ]
            : []),
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `SecureWatch ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ replay manual ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      },
    ],
  };

  let ok = false;
  let status: number | undefined;
  let errMsg: string | null = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(integration.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    status = res.status;
    ok = res.ok;
    if (!ok) {
      const text = await res.text().catch(() => "");
      errMsg = `HTTP ${res.status} ${text.slice(0, 200)}`;
    }
  } catch (e: unknown) {
    errMsg = safeError(e);
  }

  await admin
    .from("slack_notification_dlq")
    .update({
      replayed_at: new Date().toISOString(),
      replayed_by: userRes.user.id,
      replay_success: ok,
      last_error: ok ? item.last_error : errMsg,
      last_status: status ?? item.last_status,
      attempts: item.attempts + 1,
    })
    .eq("id", item.id);

  await admin.from("edge_function_logs").insert({
    function_name: "slack-dlq-replay",
    status: ok ? 200 : (status ?? 500),
    duration_ms: Date.now() - startedAt,
    error_message: ok ? null : errMsg,
    payload_summary: {
      dlq_id: item.id,
      integration_id: integration.id,
      success: ok,
      status,
    },
  });

  if (!ok) return json({ error: "delivery_failed", status, detail: errMsg }, 502);
  return json({ ok: true, integration: integration.name });
});
