// deno-lint-ignore-file no-explicit-any
/**
 * slack-notify
 * Envia mensagens formatadas (Slack Block Kit) para webhooks registrados em
 * `slack_integrations`. Filtra por event_type e min_severity.
 *
 * Body: { event_type: string, severity: 'warning'|'critical'|'breached',
 *         title: string, message: string, fields?: Record<string,string>,
 *         url?: string }
 */
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SEVERITY_RANK: Record<string, number> = { warning: 1, critical: 2, breached: 3 };
const SEVERITY_COLOR: Record<string, string> = {
  warning: '#F5A524',
  critical: '#F31260',
  breached: '#7828C8',
};
const SEVERITY_EMOJI: Record<string, string> = {
  warning: ':warning:',
  critical: ':rotating_light:',
  breached: ':fire:',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const startedAt = Date.now();

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const { event_type, severity, title, message, fields, url, company_id } = payload ?? {};
  if (!event_type || !severity || !title || !message) {
    return json({ error: 'missing_fields', required: ['event_type', 'severity', 'title', 'message'] }, 400);
  }
  if (!SEVERITY_RANK[severity]) {
    return json({ error: 'invalid_severity' }, 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Multi-tenant: quando company_id é enviado, seleciona integrações da empresa
  // + integrações globais (company_id IS NULL). Sem company_id, roteia apenas
  // integrações globais para preservar compatibilidade com chamadas legadas.
  let query = supabase
    .from('slack_integrations')
    .select('id, name, webhook_url, event_types, min_severity, failure_count, auto_pause_threshold, company_id')
    .eq('is_active', true)
    .is('auto_paused_at', null);

  if (company_id) {
    query = query.or(`company_id.eq.${company_id},company_id.is.null`);
  } else {
    query = query.is('company_id', null);
  }

  const { data: integrations, error } = await query;

  if (error) return json({ error: error.message }, 500);

  const targets = (integrations ?? []).filter((i: any) => {
    const rank = SEVERITY_RANK[severity] ?? 0;
    const minRank = SEVERITY_RANK[i.min_severity] ?? 99;
    return (i.event_types ?? []).includes(event_type) && rank >= minRank;
  });

  if (targets.length === 0) {
    return json({ ok: true, delivered: 0, matched: 0 });
  }

  // HTTP statuses que indicam webhook permanentemente inválido (auto-pausa imediata)
  const PERMANENT_FAILURE_STATUSES = new Set([400, 403, 404, 410]);

  const emoji = SEVERITY_EMOJI[severity];
  const color = SEVERITY_COLOR[severity];
  const fieldBlocks =
    fields && typeof fields === 'object'
      ? Object.entries(fields).map(([k, v]) => ({ type: 'mrkdwn', text: `*${k}:*\n${v}` }))
      : [];

  const slackPayload = {
    text: `${emoji} ${title}`,
    attachments: [
      {
        color,
        blocks: [
          { type: 'header', text: { type: 'plain_text', text: `${emoji} ${title}` } },
          { type: 'section', text: { type: 'mrkdwn', text: message } },
          ...(fieldBlocks.length > 0
            ? [{ type: 'section', fields: fieldBlocks.slice(0, 10) }]
            : []),
          ...(url
            ? [
                {
                  type: 'actions',
                  elements: [
                    {
                      type: 'button',
                      text: { type: 'plain_text', text: 'Abrir no painel' },
                      url,
                      style: severity === 'breached' ? 'danger' : 'primary',
                    },
                  ],
                },
              ]
            : []),
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: `SecureWatch • ${event_type} • ${new Date().toISOString()}` },
            ],
          },
        ],
      },
    ],
  };

  let delivered = 0;
  const errors: Array<{ id: string; message: string }> = [];
  const autoPaused: Array<{ id: string; name: string; reason: string }> = [];
  const retryStats: Array<{ id: string; attempts: number; recovered: boolean }> = [];

  // Retry policy: erros transitórios (429/5xx/network) tentam novamente com backoff
  // exponencial + jitter antes de contabilizar falha. Erros permanentes (400/403/404/410)
  // pulam retry e vão direto para auto-pausa.
  const MAX_ATTEMPTS = 3;
  const BASE_DELAY_MS = 500;
  const MAX_DELAY_MS = 4000;
  const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function postWithRetry(webhookUrl: string): Promise<
    | { ok: true; attempts: number }
    | { ok: false; attempts: number; status?: number; message: string; permanent: boolean }
  > {
    let lastMessage = 'unknown';
    let lastStatus: number | undefined;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) return { ok: true, attempts: attempt };
        const body = await res.text().catch(() => '');
        lastStatus = res.status;
        lastMessage = `HTTP ${res.status} ${body.slice(0, 200)}`;
        if (PERMANENT_FAILURE_STATUSES.has(res.status)) {
          return { ok: false, attempts: attempt, status: res.status, message: lastMessage, permanent: true };
        }
        if (!TRANSIENT_STATUSES.has(res.status)) {
          return { ok: false, attempts: attempt, status: res.status, message: lastMessage, permanent: false };
        }
        // Respeita Retry-After (segundos) do Slack quando presente
        const retryAfter = Number(res.headers.get('retry-after') ?? '0');
        const backoff = retryAfter > 0
          ? Math.min(retryAfter * 1000, MAX_DELAY_MS)
          : Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS);
        const jitter = Math.floor(Math.random() * 250);
        if (attempt < MAX_ATTEMPTS) await sleep(backoff + jitter);
      } catch (e: any) {
        lastMessage = String(e?.message ?? e).slice(0, 200);
        // network/timeout são transitórios
        if (attempt < MAX_ATTEMPTS) {
          const backoff = Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS);
          const jitter = Math.floor(Math.random() * 250);
          await sleep(backoff + jitter);
        }
      }
    }
    return { ok: false, attempts: MAX_ATTEMPTS, status: lastStatus, message: lastMessage, permanent: false };
  }

  for (const target of targets as any[]) {
    const result = await postWithRetry(target.webhook_url);
    if (result.ok) {
      delivered += 1;
      if (result.attempts > 1) {
        retryStats.push({ id: target.id, attempts: result.attempts, recovered: true });
      }
      await supabase
        .from('slack_integrations')
        .update({
          last_success_at: new Date().toISOString(),
          failure_count: 0,
          last_error: null,
        })
        .eq('id', target.id);
    } else {
      const msg = result.message;
      errors.push({ id: target.id, message: msg });
      retryStats.push({ id: target.id, attempts: result.attempts, recovered: false });
      const nextFailureCount = (target.failure_count ?? 0) + 1;
      const threshold = target.auto_pause_threshold ?? 5;
      const shouldPause = result.permanent || nextFailureCount >= threshold;
      const update: Record<string, unknown> = {
        last_error: msg,
        last_error_at: new Date().toISOString(),
        failure_count: nextFailureCount,
      };
      if (shouldPause) {
        const reason = result.permanent
          ? `Webhook inválido (HTTP ${result.status}) — pausado após ${result.attempts} tentativa(s)`
          : `${nextFailureCount} falhas consecutivas atingiram o limite de ${threshold} (após ${result.attempts} tentativas por envio)`;
        update.is_active = false;
        update.auto_paused_at = new Date().toISOString();
        update.auto_pause_reason = reason;
        autoPaused.push({ id: target.id, name: target.name, reason });
      }
      await supabase.from('slack_integrations').update(update).eq('id', target.id);

      // Dead-Letter Queue: persiste a mensagem para que admin possa reenviar após
      // corrigir o webhook. Só entra na DLQ se for falha permanente OU se a
      // integração acabou de ser auto-pausada (evita duplicar itens durante
      // falhas transitórias que ainda podem se recuperar em próximas execuções).
      if (result.permanent || shouldPause) {
        await supabase.from('slack_notification_dlq').insert({
          integration_id: target.id,
          event_type,
          severity,
          title,
          message,
          fields: fields ?? {},
          url: url ?? null,
          last_error: msg,
          last_status: result.status ?? null,
          attempts: result.attempts,
          permanent: result.permanent,
        });
      }
    }

  }

  await supabase.from('edge_function_logs').insert({
    function_name: 'slack-notify',
    status: errors.length === 0 ? 200 : 207,
    duration_ms: Date.now() - startedAt,
    error_message: errors.length > 0 ? errors.map((e) => e.message).join(' | ').slice(0, 500) : null,
    payload_summary: {
      event_type,
      severity,
      delivered,
      matched: targets.length,
      errors: errors.length,
      auto_paused: autoPaused,
      retries: retryStats,
    },
  });

  // ─── Fallback via Resend ────────────────────────────────────────────────
  // Se todos os alvos ativos falharam (delivered === 0 && matched > 0), ou
  // não houve alvos porque todos estão auto-pausados e a severidade é
  // critical/breached, enviamos por e-mail via Resend usando destinatários
  // configurados em alert_notification_settings (setting_type='slack_fallback').
  let fallbackResult: {
    attempted: boolean;
    delivered: number;
    recipients: number;
    error?: string;
    reason?: string;
  } = { attempted: false, delivered: 0, recipients: 0 };

  const shouldFallback =
    (targets.length > 0 && delivered === 0) ||
    (targets.length === 0 && (SEVERITY_RANK[severity] ?? 0) >= SEVERITY_RANK.critical);

  if (shouldFallback) {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      fallbackResult = { attempted: true, delivered: 0, recipients: 0, reason: 'resend_key_missing' };
    } else {
      const { data: fbSettings } = await supabase
        .from('alert_notification_settings')
        .select('recipient_emails, enabled, notify_critical, notify_high, notify_medium, notify_low')
        .eq('setting_type', 'slack_fallback')
        .maybeSingle();

      const passesSeverity = (() => {
        if (!fbSettings) return false;
        if (severity === 'breached' || severity === 'critical') return fbSettings.notify_critical;
        if (severity === 'warning') return fbSettings.notify_high || fbSettings.notify_medium;
        return fbSettings.notify_low;
      })();

      const recipients = (fbSettings?.recipient_emails ?? []).filter(
        (e: string) => typeof e === 'string' && e.includes('@'),
      );

      if (!fbSettings?.enabled || !passesSeverity || recipients.length === 0) {
        fallbackResult = {
          attempted: true,
          delivered: 0,
          recipients: recipients.length,
          reason: !fbSettings?.enabled
            ? 'fallback_disabled'
            : !passesSeverity
            ? 'severity_filtered'
            : 'no_recipients',
        };
      } else {
        const fieldsHtml =
          fields && typeof fields === 'object'
            ? Object.entries(fields)
                .map(
                  ([k, v]) =>
                    `<tr><td style="padding:4px 12px 4px 0;color:#666"><b>${k}</b></td><td style="padding:4px 0">${String(v)}</td></tr>`,
                )
                .join('')
            : '';
        const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto">
  <div style="border-left:4px solid ${color};padding:16px 20px;background:#fafafa">
    <h2 style="margin:0 0 8px;color:#111">${emoji} ${title}</h2>
    <p style="margin:0;color:#333;white-space:pre-wrap">${message}</p>
  </div>
  ${fieldsHtml ? `<table style="margin:16px 0;border-collapse:collapse">${fieldsHtml}</table>` : ''}
  ${url ? `<p><a href="${url}" style="display:inline-block;background:${color};color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Abrir no painel</a></p>` : ''}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:12px;color:#888">
    Este e-mail foi enviado como <b>fallback</b> porque a entrega via Slack falhou
    (${event_type} • severidade ${severity} • ${new Date().toISOString()}).
  </p>
</div>`;

        try {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: Deno.env.get('RESEND_FROM_EMAIL') ?? 'SecureWatch <alerts@securewatch.app>',
              to: recipients,
              subject: `[Fallback ${severity.toUpperCase()}] ${title}`,
              html,
            }),
          });
          if (emailRes.ok) {
            fallbackResult = {
              attempted: true,
              delivered: recipients.length,
              recipients: recipients.length,
              reason: 'sent_via_resend',
            };
          } else {
            const body = await emailRes.text().catch(() => '');
            fallbackResult = {
              attempted: true,
              delivered: 0,
              recipients: recipients.length,
              error: `HTTP ${emailRes.status} ${body.slice(0, 200)}`,
            };
          }
        } catch (e: any) {
          fallbackResult = {
            attempted: true,
            delivered: 0,
            recipients: recipients.length,
            error: String(e?.message ?? e).slice(0, 200),
          };
        }
      }
    }

    await supabase.from('edge_function_logs').insert({
      function_name: 'slack-notify:fallback',
      status: fallbackResult.delivered > 0 ? 200 : 207,
      duration_ms: Date.now() - startedAt,
      error_message: fallbackResult.error ?? null,
      payload_summary: {
        event_type,
        severity,
        slack_matched: targets.length,
        slack_delivered: delivered,
        fallback: fallbackResult,
      },
    });
  }

  return json({
    ok: true,
    delivered,
    matched: targets.length,
    errors,
    auto_paused: autoPaused,
    retries: retryStats,
    fallback: fallbackResult,
  });
});
