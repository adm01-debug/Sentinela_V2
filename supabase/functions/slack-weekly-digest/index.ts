// deno-lint-ignore-file no-explicit-any
/**
 * slack-weekly-digest
 * Envia digest semanal consolidado (últimos 7 dias) via slack-notify:
 *  - Violações por severidade
 *  - Auto-pausas de webhook e MTTR agregado
 *  - Fila DLQ (pendentes/reenviadas)
 *  - Disputas SLA (abertas/vencidas)
 * Agendado toda segunda 09:00 UTC via pg_cron.
 */
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

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

  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  // Violações por severidade
  const { data: violations } = await supabase
    .from('security_violations')
    .select('severity')
    .gte('created_at', since);

  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const v of violations ?? []) {
    const s = (v as any).severity ?? 'medium';
    bySeverity[s] = (bySeverity[s] ?? 0) + 1;
  }
  const totalViolations = (violations ?? []).length;

  // DLQ
  const { count: dlqPending } = await supabase
    .from('slack_notification_dlq')
    .select('id', { count: 'exact', head: true })
    .is('replayed_at', null);

  const { count: dlqReplayed } = await supabase
    .from('slack_notification_dlq')
    .select('id', { count: 'exact', head: true })
    .not('replayed_at', 'is', null)
    .gte('replayed_at', since);

  // MTTR agregado
  const { data: mttrRows } = await supabase.from('slack_webhook_mttr').select('*');
  const avgP95 =
    (mttrRows ?? []).length > 0
      ? Math.round(
          (mttrRows ?? []).reduce((a, r: any) => a + (r.mttr_p95_seconds ?? 0), 0) /
            (mttrRows ?? []).length,
        )
      : 0;

  // Disputas
  const { count: disputesOpen } = await supabase
    .from('violation_disputes')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  const fmtMin = (s: number) => (s < 60 ? `${s}s` : `${Math.round(s / 60)}min`);

  const severity =
    bySeverity.critical > 0 ? 'critical' : bySeverity.high > 5 ? 'warning' : 'warning';

  const notifyRes = await fetch(`${supabaseUrl}/functions/v1/slack-notify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      event_type: 'weekly_digest',
      severity,
      title: 'Digest semanal de segurança & integrações',
      message: `Resumo dos últimos 7 dias: ${totalViolations} violações registradas.`,
      fields: {
        violacoes_total: String(totalViolations),
        criticas: String(bySeverity.critical),
        altas: String(bySeverity.high),
        medias: String(bySeverity.medium),
        baixas: String(bySeverity.low),
        dlq_pendentes: String(dlqPending ?? 0),
        dlq_reenviadas_7d: String(dlqReplayed ?? 0),
        mttr_p95_medio: fmtMin(avgP95),
        disputas_abertas: String(disputesOpen ?? 0),
      },
    }),
  });

  await supabase.from('edge_function_logs').insert({
    function_name: 'slack-weekly-digest',
    method: 'CRON',
    status: notifyRes.status,
    duration_ms: 0,
    payload_summary: {
      total_violations: totalViolations,
      by_severity: bySeverity,
      dlq_pending: dlqPending,
      mttr_p95_avg: avgP95,
      disputes_open: disputesOpen,
    },
  });

  return json({
    ok: true,
    dispatched: notifyRes.ok,
    totals: {
      violations: totalViolations,
      by_severity: bySeverity,
      dlq_pending: dlqPending,
      dlq_replayed_7d: dlqReplayed,
      mttr_p95_avg_seconds: avgP95,
      disputes_open: disputesOpen,
    },
  });
});
