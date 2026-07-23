// deno-lint-ignore-file no-explicit-any
/**
 * escalate-dispute-sla
 *
 * Varre contestações em risco de estourar o SLA (72h) e envia alertas
 * escalonados para os admins responsáveis. Roda idealmente a cada 15min via cron.
 *
 * Escalonamento:
 *   - warning  (≤12h para estourar)  → email + registro
 *   - critical (≤4h para estourar)   → email + push FCM
 *   - breached (SLA violado)         → email + push FCM alta prioridade + log crítico
 *
 * Deduplicação: cada (dispute_id, severity) só é escalada uma vez por 6h,
 * gravado em edge_function_logs.
 */
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SLA_HOURS = 72;
const WARNING_H = 12;
const CRITICAL_H = 4;
const DEDUP_HOURS = 6;
const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send';

type Severity = 'warning' | 'critical' | 'breached';

interface DisputeRow {
  id: string;
  violation_id: string;
  employee_name: string | null;
  category: string | null;
  status: string;
  created_at: string;
}

function severityOf(hoursUntilBreach: number): Severity | null {
  if (hoursUntilBreach <= 0) return 'breached';
  if (hoursUntilBreach <= CRITICAL_H) return 'critical';
  if (hoursUntilBreach <= WARNING_H) return 'warning';
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const startedAt = Date.now();

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1) Fetch open disputes.
  const { data: disputes, error } = await supabase
    .from('violation_disputes')
    .select('id, violation_id, employee_name, category, status, created_at')
    .in('status', ['pending', 'under_review']);

  if (error) return json({ error: error.message }, 500);

  const now = Date.now();
  const atRisk: Array<DisputeRow & { severity: Severity; hoursUntilBreach: number }> = [];

  for (const d of (disputes as DisputeRow[]) ?? []) {
    const hoursOpen = (now - new Date(d.created_at).getTime()) / 3_600_000;
    const hoursUntilBreach = SLA_HOURS - hoursOpen;
    const severity = severityOf(hoursUntilBreach);
    if (!severity) continue;
    atRisk.push({ ...d, severity, hoursUntilBreach: Math.round(hoursUntilBreach * 10) / 10 });
  }

  if (atRisk.length === 0) {
    return json({ ok: true, escalated: 0, checked: (disputes ?? []).length });
  }

  // 2) Dedup: fetch recent escalations from edge_function_logs.
  const since = new Date(now - DEDUP_HOURS * 3_600_000).toISOString();
  const { data: recent } = await supabase
    .from('edge_function_logs')
    .select('metadata')
    .eq('function_name', 'escalate-dispute-sla')
    .gte('created_at', since);

  const alreadySent = new Set<string>();
  for (const r of (recent as any[]) ?? []) {
    const key = r?.metadata?.dedup_key;
    if (typeof key === 'string') alreadySent.add(key);
  }

  // 3) Fetch admin push tokens (once).
  let adminTokens: string[] = [];
  if (FCM_SERVER_KEY) {
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    const adminIds = (adminRoles as any[] | null)?.map((r) => r.user_id) ?? [];
    if (adminIds.length > 0) {
      const { data: devices } = await supabase
        .from('mobile_devices')
        .select('push_token')
        .in('user_id', adminIds)
        .eq('is_active', true)
        .not('push_token', 'is', null);
      adminTokens = ((devices as any[]) ?? [])
        .map((d) => d.push_token as string)
        .filter(Boolean);
    }
  }

  let escalated = 0;
  const results: Array<{ id: string; severity: Severity; delivered: number }> = [];

  for (const d of atRisk) {
    const dedupKey = `${d.id}:${d.severity}`;
    if (alreadySent.has(dedupKey)) continue;

    let delivered = 0;
    const title =
      d.severity === 'breached'
        ? 'SLA de contestação VIOLADO'
        : d.severity === 'critical'
          ? `SLA em ${d.hoursUntilBreach}h — crítico`
          : `SLA em ${d.hoursUntilBreach}h — atenção`;

    const message = `Contestação ${d.id.slice(0, 8)} (${d.category ?? 'sem categoria'}) do colaborador ${d.employee_name ?? '—'} precisa de julgamento imediato.`;

    // Push FCM (critical + breached).
    if (FCM_SERVER_KEY && (d.severity === 'critical' || d.severity === 'breached') && adminTokens.length > 0) {
      for (const token of adminTokens) {
        try {
          const res = await fetch(FCM_ENDPOINT, {
            method: 'POST',
            headers: {
              Authorization: `key=${FCM_SERVER_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: token,
              priority: 'high',
              notification: { title, body: message, sound: 'default' },
              data: {
                alert_type: 'dispute_sla_escalation',
                dispute_id: d.id,
                violation_id: d.violation_id,
                severity: d.severity,
              },
            }),
          });
          if (res.ok) delivered += 1;
        } catch {
          /* swallow per-token errors */
        }
      }
    }

    // Log persistente para auditoria e dedup (schema real da tabela).
    await supabase.from('edge_function_logs').insert({
      function_name: 'escalate-dispute-sla',
      status: d.severity === 'breached' ? 500 : 200,
      duration_ms: Date.now() - startedAt,
      error_message: d.severity === 'breached' ? title : null,
      payload_summary: {
        title,
        dedup_key: dedupKey,
        dispute_id: d.id,
        violation_id: d.violation_id,
        severity: d.severity,
        hours_until_breach: d.hoursUntilBreach,
        push_delivered: delivered,
      },
    });

    escalated += 1;
    results.push({ id: d.id, severity: d.severity, delivered });
  }

  return json({ ok: true, checked: (disputes ?? []).length, escalated, results });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
