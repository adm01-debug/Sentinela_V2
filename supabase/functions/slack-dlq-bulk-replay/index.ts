// deno-lint-ignore-file no-explicit-any
/**
 * slack-dlq-bulk-replay
 * Reenvia em lote mensagens pendentes da DLQ para uma integração Slack.
 * Aplica throttle (~300ms entre envios) para respeitar rate limit do Slack.
 * Máximo 50 itens por invocação.
 */
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const MAX_BATCH = 50;
const DELAY_MS = 300;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const SEVERITY_EMOJI: Record<string, string> = {
  warning: ':warning:',
  critical: ':rotating_light:',
  breached: ':fire:',
};
const SEVERITY_COLOR: Record<string, string> = {
  warning: '#F5A524',
  critical: '#F31260',
  breached: '#7828C8',
};

function buildPayload(item: any) {
  const emoji = SEVERITY_EMOJI[item.severity] ?? ':bell:';
  const color = SEVERITY_COLOR[item.severity] ?? '#0EA5E9';
  const fields = (item.fields ?? {}) as Record<string, string>;
  const fieldBlocks = Object.entries(fields).map(([k, v]) => ({
    type: 'mrkdwn',
    text: `*${k}:*\n${v}`,
  }));
  return {
    text: `${emoji} [REPLAY-BULK] ${item.title}`,
    attachments: [
      {
        color,
        blocks: [
          { type: 'header', text: { type: 'plain_text', text: `${emoji} ${item.title}` } },
          { type: 'section', text: { type: 'mrkdwn', text: item.message } },
          ...(fieldBlocks.length > 0
            ? [{ type: 'section', fields: fieldBlocks.slice(0, 10) }]
            : []),
          ...(item.url
            ? [
                {
                  type: 'actions',
                  elements: [
                    {
                      type: 'button',
                      text: { type: 'plain_text', text: 'Abrir no painel' },
                      url: item.url,
                    },
                  ],
                },
              ]
            : []),
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `SecureWatch • replay em lote • ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      },
    ],
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const startedAt = Date.now();

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'unauthorized' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userRes, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userRes?.user) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: isAdmin } = await admin.rpc('has_role', {
    _user_id: userRes.user.id,
    _role: 'admin',
  });
  if (!isAdmin) return json({ error: 'forbidden' }, 403);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const integrationId: string | undefined = body?.integration_id;
  if (!integrationId) return json({ error: 'missing_integration_id' }, 400);

  const { data: integration, error: intErr } = await admin
    .from('slack_integrations')
    .select('id, name, webhook_url, is_active, auto_paused_at')
    .eq('id', integrationId)
    .maybeSingle();
  if (intErr) return json({ error: intErr.message }, 500);
  if (!integration) return json({ error: 'integration_not_found' }, 404);
  if (!integration.is_active || integration.auto_paused_at) {
    return json(
      { error: 'integration_inactive', hint: 'Reative a integração antes de reenviar.' },
      409,
    );
  }

  const { data: items, error: itemsErr } = await admin
    .from('slack_notification_dlq')
    .select('*')
    .eq('integration_id', integrationId)
    .is('replayed_at', null)
    .order('created_at', { ascending: true })
    .limit(MAX_BATCH);
  if (itemsErr) return json({ error: itemsErr.message }, 500);
  if (!items || items.length === 0) return json({ ok: true, processed: 0, succeeded: 0, failed: 0 });

  let succeeded = 0;
  let failed = 0;
  const results: Array<{ id: string; ok: boolean; status?: number; error?: string }> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let ok = false;
    let status: number | undefined;
    let errMsg: string | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(integration.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(item)),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      status = res.status;
      ok = res.ok;
      if (!ok) {
        const text = await res.text().catch(() => '');
        errMsg = `HTTP ${res.status} ${text.slice(0, 200)}`;
      }
    } catch (e: any) {
      errMsg = String(e?.message ?? e).slice(0, 200);
    }

    await admin
      .from('slack_notification_dlq')
      .update({
        replayed_at: new Date().toISOString(),
        replayed_by: userRes.user.id,
        replay_success: ok,
        last_error: ok ? item.last_error : errMsg,
        last_status: status ?? item.last_status,
        attempts: item.attempts + 1,
      })
      .eq('id', item.id);

    results.push({ id: item.id, ok, status, error: errMsg ?? undefined });
    if (ok) succeeded++;
    else failed++;

    // Aborta em cascata se webhook começou a rejeitar permanentemente
    if (!ok && status && [400, 403, 404, 410].includes(status)) {
      break;
    }

    // Throttle entre envios (exceto no último)
    if (i < items.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  await admin.from('edge_function_logs').insert({
    function_name: 'slack-dlq-bulk-replay',
    status: failed === 0 ? 200 : 207,
    duration_ms: Date.now() - startedAt,
    error_message: failed > 0 ? `${failed} item(s) falharam` : null,
    payload_summary: {
      integration_id: integration.id,
      processed: results.length,
      succeeded,
      failed,
    },
  });

  return json({
    ok: true,
    integration: integration.name,
    processed: results.length,
    succeeded,
    failed,
    results,
  });
});
