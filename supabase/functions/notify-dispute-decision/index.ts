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
import { requireUserOrServiceRole } from '../_shared/auth.ts';

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

  const auth = await requireUserOrServiceRole(req).catch(() => null);
  if (!auth) return json({ error: 'unauthorized' }, 401);

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

  // Somente admin resolve contestacao (policy RLS "Admins can update disputes"
  // em violation_disputes); o push carrega essa decisao, entao exige o mesmo
  // papel. service_role (automacao interna) segue liberado.
  if (!auth.isServiceRole) {
    const callerId = auth.user?.id;
    if (!callerId) return json({ error: 'unauthorized' }, 401);
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: callerId,
      _role: 'admin',
    });
    if (!isAdmin) return json({ error: 'forbidden' }, 403);
  }

  const { data: dispute, error: dErr } = await supabase
    .from('violation_disputes')
    .select(
      'id, violation_id, company_id, employee_name, status, category, resolution_notes, resolved_at'
    )
    .eq('id', body.dispute_id)
    .maybeSingle();

  if (dErr) return json({ error: dErr.message }, 500);
  if (!dispute) return json({ error: 'dispute_not_found' }, 404);

  // A contestacao e de uma empresa: a policy de UPDATE
  // (20260723152502_...:41-43) exige user_in_company(uid, company_id) e role
  // admin, mas aqui a leitura roda com service_role, que ignora RLS. Sem esta
  // checagem o admin da empresa A dispara o push da disputa da empresa B (e o
  // payload leva as notas da decisao dela).
  if (!auth.isServiceRole) {
    const callerId = auth.user?.id;
    if (!callerId) return json({ error: 'unauthorized' }, 401);
    const { data: sameCompany, error: companyErr } = await supabase.rpc('user_in_company', {
      _user_id: callerId,
      _company_id: dispute.company_id,
    });
    if (companyErr) return json({ error: companyErr.message }, 500);
    if (!sameCompany) return json({ error: 'forbidden' }, 403);
  }

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
    new_value: {
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
