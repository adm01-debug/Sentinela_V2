// deno-lint-ignore-file no-explicit-any
/**
 * slack-mttr-monitor
 * Verifica a view `slack_webhook_mttr` e dispara alertas proativos quando
 * o MTTR p95 de uma integração degrada acima dos thresholds definidos.
 *
 * Thresholds:
 *   - warning:  p95 >= 1800s (30min)
 *   - critical: p95 >= 3600s (60min)
 *
 * Deduplicação: só alerta se ainda não houve alerta para a mesma integração
 * no mesmo severity nas últimas 6h (grava em edge_function_logs).
 */
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const WARNING_THRESHOLD = 1800;
const CRITICAL_THRESHOLD = 3600;
const DEDUP_WINDOW_HOURS = 6;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: rows, error } = await supabase
    .from('slack_webhook_mttr')
    .select('*');

  if (error) {
    console.error('mttr-monitor: fetch view error', error);
    return json({ error: 'view_fetch_failed', details: error.message }, 500);
  }

  const alerts: Array<{ integration: string; severity: string; p95: number }> = [];
  const skipped: Array<{ integration: string; reason: string }> = [];
  const since = new Date(Date.now() - DEDUP_WINDOW_HOURS * 3600 * 1000).toISOString();

  for (const row of rows ?? []) {
    const p95 = row.mttr_p95_seconds ?? 0;
    let severity: 'warning' | 'critical' | null = null;
    if (p95 >= CRITICAL_THRESHOLD) severity = 'critical';
    else if (p95 >= WARNING_THRESHOLD) severity = 'warning';
    if (!severity) continue;

    // dedup check
    const { count } = await supabase
      .from('edge_function_logs')
      .select('id', { count: 'exact', head: true })
      .eq('function_name', 'slack-mttr-monitor')
      .contains('payload_summary', { integration_id: row.integration_id, severity })
      .gte('created_at', since);

    if ((count ?? 0) > 0) {
      skipped.push({ integration: row.integration_name, reason: 'deduped' });
      continue;
    }

    // dispatch via slack-notify
    const notifyRes = await fetch(`${supabaseUrl}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        event_type: 'mttr_degradation',
        severity,
        title: `MTTR ${severity === 'critical' ? 'CRÍTICO' : 'degradado'} — ${row.integration_name}`,
        message: `Tempo de recuperação p95 = ${Math.round(p95 / 60)}min (limite: ${
          severity === 'critical' ? '60min' : '30min'
        }).`,
        fields: {
          integration: row.integration_name,
          eventos_recuperacao: String(row.recovery_events ?? 0),
          p50: `${Math.round((row.mttr_p50_seconds ?? 0) / 60)}min`,
          p95: `${Math.round(p95 / 60)}min`,
          max: `${Math.round((row.mttr_max_seconds ?? 0) / 60)}min`,
        },
      }),
    });

    await supabase.from('edge_function_logs').insert({
      function_name: 'slack-mttr-monitor',
      status: severity,
      duration_ms: 0,
      metadata: {
        integration_id: row.integration_id,
        integration_name: row.integration_name,
        p95_seconds: p95,
        notify_status: notifyRes.status,
      },
    });

    alerts.push({ integration: row.integration_name, severity, p95 });
  }

  return json({ ok: true, alerts, skipped, checked: rows?.length ?? 0 });
});
