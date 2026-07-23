// deno-lint-ignore-file no-explicit-any
/**
 * slack-weekly-digest
 * Envia digest semanal (últimos 7 dias) via slack-notify.
 *
 * Multi-tenant:
 *  - Para cada empresa que tenha ao menos uma integração Slack ativa
 *    (com company_id definido), gera um digest filtrado por essa empresa.
 *  - Também envia um digest global (company_id IS NULL) agregando todas
 *    as métricas, roteando apenas para integrações globais.
 *
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

const fmtMin = (s: number) => (s < 60 ? `${s}s` : `${Math.round(s / 60)}min`);

async function buildDigest(
  supabase: ReturnType<typeof createClient>,
  since: string,
  scope: { company_id: string | null; company_name: string | null },
) {
  const isGlobal = scope.company_id === null;

  // Violações por severidade
  let vq = supabase.from('security_violations').select('severity').gte('created_at', since);
  if (!isGlobal) vq = vq.eq('company_id', scope.company_id);
  const { data: violations } = await vq;

  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const v of violations ?? []) {
    const s = (v as any).severity ?? 'medium';
    bySeverity[s] = (bySeverity[s] ?? 0) + 1;
  }
  const totalViolations = (violations ?? []).length;

  // DLQ (global — não há company_id na DLQ; incluímos apenas no digest global)
  let dlqPending = 0;
  let dlqReplayed = 0;
  let avgP95 = 0;
  if (isGlobal) {
    const { count: p } = await supabase
      .from('slack_notification_dlq')
      .select('id', { count: 'exact', head: true })
      .is('replayed_at', null);
    dlqPending = p ?? 0;

    const { count: r } = await supabase
      .from('slack_notification_dlq')
      .select('id', { count: 'exact', head: true })
      .not('replayed_at', 'is', null)
      .gte('replayed_at', since);
    dlqReplayed = r ?? 0;

    const { data: mttrRows } = await supabase.from('slack_webhook_mttr').select('*');
    avgP95 =
      (mttrRows ?? []).length > 0
        ? Math.round(
            (mttrRows ?? []).reduce((a, r: any) => a + (r.mttr_p95_seconds ?? 0), 0) /
              (mttrRows ?? []).length,
          )
        : 0;
  }

  // Disputas
  let dq = supabase
    .from('violation_disputes')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (!isGlobal) dq = dq.eq('company_id', scope.company_id);
  const { count: disputesOpen } = await dq;

  const severity =
    bySeverity.critical > 0 ? 'critical' : bySeverity.high > 5 ? 'warning' : 'warning';

  const scopeLabel = isGlobal
    ? 'Global (todas as empresas)'
    : `Empresa: ${scope.company_name ?? scope.company_id}`;

  const fields: Record<string, string> = {
    escopo: scopeLabel,
    violacoes_total: String(totalViolations),
    criticas: String(bySeverity.critical),
    altas: String(bySeverity.high),
    medias: String(bySeverity.medium),
    baixas: String(bySeverity.low),
    disputas_abertas: String(disputesOpen ?? 0),
  };
  if (isGlobal) {
    fields.dlq_pendentes = String(dlqPending);
    fields.dlq_reenviadas_7d = String(dlqReplayed);
    fields.mttr_p95_medio = fmtMin(avgP95);
  }

  return {
    severity,
    fields,
    totals: {
      violations: totalViolations,
      by_severity: bySeverity,
      dlq_pending: dlqPending,
      dlq_replayed_7d: dlqReplayed,
      mttr_p95_avg_seconds: avgP95,
      disputes_open: disputesOpen ?? 0,
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  // Descobre empresas com integrações Slack ativas configuradas por tenant
  const { data: tenantIntegrations } = await supabase
    .from('slack_integrations')
    .select('company_id, companies:company_id(id, name)')
    .not('company_id', 'is', null)
    .eq('is_active', true);

  const companies = new Map<string, string | null>();
  for (const row of (tenantIntegrations ?? []) as any[]) {
    if (row.company_id) {
      companies.set(row.company_id, row.companies?.name ?? null);
    }
  }

  const runs: Array<{
    scope: string;
    company_id: string | null;
    dispatched: boolean;
    status: number;
    totals: unknown;
  }> = [];

  // 1) Digest global (integrações sem company_id)
  const globalDigest = await buildDigest(supabase, since, { company_id: null, company_name: null });
  const globalRes = await fetch(`${supabaseUrl}/functions/v1/slack-notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({
      event_type: 'weekly_digest',
      severity: globalDigest.severity,
      title: 'Digest semanal — visão global',
      message: `Resumo dos últimos 7 dias: ${globalDigest.totals.violations} violações registradas em toda a plataforma.`,
      fields: globalDigest.fields,
    }),
  });
  runs.push({
    scope: 'global',
    company_id: null,
    dispatched: globalRes.ok,
    status: globalRes.status,
    totals: globalDigest.totals,
  });

  // 2) Digest por empresa (throttle leve para não saturar Slack)
  for (const [companyId, companyName] of companies.entries()) {
    const digest = await buildDigest(supabase, since, {
      company_id: companyId,
      company_name: companyName,
    });
    const res = await fetch(`${supabaseUrl}/functions/v1/slack-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({
        event_type: 'weekly_digest',
        severity: digest.severity,
        title: `Digest semanal — ${companyName ?? 'sua empresa'}`,
        message: `Resumo dos últimos 7 dias: ${digest.totals.violations} violações na sua empresa.`,
        fields: digest.fields,
        company_id: companyId,
      }),
    });
    runs.push({
      scope: 'company',
      company_id: companyId,
      dispatched: res.ok,
      status: res.status,
      totals: digest.totals,
    });
    // throttle
    await new Promise((r) => setTimeout(r, 300));
  }

  await supabase.from('edge_function_logs').insert({
    function_name: 'slack-weekly-digest',
    method: 'CRON',
    status: runs.every((r) => r.dispatched) ? 200 : 207,
    duration_ms: 0,
    payload_summary: {
      runs_total: runs.length,
      companies_processed: companies.size,
      global_dispatched: runs[0]?.dispatched ?? false,
      companies_dispatched: runs.filter((r) => r.scope === 'company' && r.dispatched).length,
    },
  });

  return json({ ok: true, runs });
});
