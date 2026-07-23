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

  for (const target of targets as any[]) {
    try {
      const res = await fetch(target.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
      });
      if (res.ok) {
        delivered += 1;
        await supabase
          .from('slack_integrations')
          .update({
            last_success_at: new Date().toISOString(),
            failure_count: 0,
            last_error: null,
          })
          .eq('id', target.id);
      } else {
        const body = await res.text().catch(() => '');
        const msg = `HTTP ${res.status} ${body.slice(0, 200)}`;
        errors.push({ id: target.id, message: msg });
        const nextFailureCount = (target.failure_count ?? 0) + 1;
        const threshold = target.auto_pause_threshold ?? 5;
        const isPermanent = PERMANENT_FAILURE_STATUSES.has(res.status);
        const shouldPause = isPermanent || nextFailureCount >= threshold;
        const update: Record<string, unknown> = {
          last_error: msg,
          last_error_at: new Date().toISOString(),
          failure_count: nextFailureCount,
        };
        if (shouldPause) {
          const reason = isPermanent
            ? `Webhook inválido (HTTP ${res.status}) — pausado automaticamente`
            : `${nextFailureCount} falhas consecutivas atingiram o limite de ${threshold}`;
          update.is_active = false;
          update.auto_paused_at = new Date().toISOString();
          update.auto_pause_reason = reason;
          autoPaused.push({ id: target.id, name: target.name, reason });
        }
        await supabase.from('slack_integrations').update(update).eq('id', target.id);
      }
    } catch (e: any) {
      const msg = String(e?.message ?? e).slice(0, 200);
      errors.push({ id: target.id, message: msg });
      const nextFailureCount = (target.failure_count ?? 0) + 1;
      const threshold = target.auto_pause_threshold ?? 5;
      const update: Record<string, unknown> = {
        last_error: msg,
        last_error_at: new Date().toISOString(),
        failure_count: nextFailureCount,
      };
      if (nextFailureCount >= threshold) {
        const reason = `${nextFailureCount} falhas consecutivas atingiram o limite de ${threshold}`;
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
    },
  });

  return json({ ok: true, delivered, matched: targets.length, errors, auto_paused: autoPaused });
});
