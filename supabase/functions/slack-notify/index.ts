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

  const { event_type, severity, title, message, fields, url } = payload ?? {};
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

  const { data: integrations, error } = await supabase
    .from('slack_integrations')
    .select('id, name, webhook_url, event_types, min_severity, failure_count, auto_pause_threshold')
    .eq('is_active', true)
    .is('auto_paused_at', null);

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

  return json({
    ok: true,
    delivered,
    matched: targets.length,
    errors,
    auto_paused: autoPaused,
    retries: retryStats,
  });
});
