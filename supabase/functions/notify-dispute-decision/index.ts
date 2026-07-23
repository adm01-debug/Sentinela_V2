// deno-lint-ignore-file no-explicit-any
/**
 * notify-dispute-decision
 *
 * Notifica o colaborador contestante sobre a decisão do admin/manager
 * (approved | rejected | under_review | withdrawn). Envia push FCM para
 * todos os dispositivos móveis ativos e registra trilha de auditoria.
 * O agente desktop também escuta via Realtime na tabela violation_disputes.
 */
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface Body {
  dispute_id: string;
}

const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send';

const STATUS_LABEL: Record<string, string> = {
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  under_review: 'Em análise',
  withdrawn: 'Retirada',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY');

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  if (!body?.dispute_id) return json({ error: 'dispute_id_required' }, 400);

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: dispute, error: dErr } = await supabase
    .from('violation_disputes')
    .select('id, violation_id, employee_name, status, category, resolution_notes, resolved_at')
    .eq('id', body.dispute_id)
    .maybeSingle();

  if (dErr) return json({ error: dErr.message }, 500);
  if (!dispute) return json({ error: 'dispute_not_found' }, 404);
  if (!dispute.status || dispute.status === 'pending') {
    return json({ error: 'not_decided_yet' }, 400);
  }

  let delivered = 0;
  const results: any[] = [];

  if (FCM_SERVER_KEY && dispute.employee_name) {
    const { data: devices } = await supabase
      .from('mobile_devices')
      .select('id, push_token')
      .eq('employee_name', dispute.employee_name)
      .eq('is_active', true)
      .not('push_token', 'is', null);

    for (const device of (devices as any[]) ?? []) {
      const payload = {
        to: device.push_token,
        priority: 'high',
        notification: {
          title: `Contestação ${STATUS_LABEL[dispute.status] ?? dispute.status}`,
          body:
            dispute.resolution_notes?.slice(0, 200) ??
            'Sua contestação foi analisada. Toque para ver os detalhes.',
          sound: 'default',
        },
        data: {
          alert_type: 'dispute_decision',
          dispute_id: dispute.id,
          violation_id: dispute.violation_id,
          status: dispute.status,
        },
        android: { priority: 'HIGH' },
      };
      try {
        const res = await fetch(FCM_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `key=${FCM_SERVER_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const respData = await res.json().catch(() => ({}));
        results.push({ device_id: device.id, ok: res.ok, status: res.status, response: respData });
        if (res.ok) delivered += 1;
      } catch (e) {
        results.push({ device_id: device.id, ok: false, error: (e as Error).message });
      }
    }
  }

  await supabase.from('settings_audit_log').insert({
    action: 'dispute_decision_notification_sent',
    entity_type: 'violation_disputes',
    entity_id: dispute.id,
    metadata: {
      status: dispute.status,
      violation_id: dispute.violation_id,
      delivered,
      fcm_configured: !!FCM_SERVER_KEY,
      results,
    } as any,
  });

  return json({ ok: true, delivered, results });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
