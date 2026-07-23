// deno-lint-ignore-file no-explicit-any
/**
 * notify-mobile-violation
 *
 * Envia notificação push (FCM) a todos os dispositivos móveis ativos do colaborador
 * envolvido em uma violação, com payload que aciona o overlay LGPD de ciência no
 * agente mobile (paridade com o overlay do Electron desktop).
 *
 * Ao ser aberta, a notificação leva o colaborador ao fluxo de reconhecimento formal
 * via a função `acknowledge-violation` (mesmo backend do desktop).
 */
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface Body {
  violation_id: string;
}

const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (!FCM_SERVER_KEY) {
    return json({ error: 'fcm_not_configured' }, 503);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  if (!body?.violation_id) {
    return json({ error: 'violation_id_required' }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: violation, error: vErr } = await supabase
    .from('security_violations')
    .select(
      'id, company_id, employee_name, policy_name, severity, description, violation_type, employee_notified_at',
    )
    .eq('id', body.violation_id)
    .maybeSingle();

  if (vErr) return json({ error: vErr.message }, 500);
  if (!violation) return json({ error: 'violation_not_found' }, 404);
  if (!violation.employee_name) return json({ error: 'no_employee' }, 400);

  const { data: devices, error: dErr } = await supabase
    .from('mobile_devices')
    .select('id, device_model, os_type, push_token')
    .eq('employee_name', violation.employee_name)
    .eq('is_active', true)
    .not('push_token', 'is', null);

  if (dErr) return json({ error: dErr.message }, 500);
  if (!devices || devices.length === 0) {
    return json({ ok: true, delivered: 0, reason: 'no_active_devices' });
  }

  const severityLabel = ({ low: 'Baixa', medium: 'Média', high: 'Alta', critical: 'Crítica' } as Record<string, string>)[
    violation.severity ?? 'medium'
  ] ?? 'Média';

  const results = await Promise.all(
    (devices as any[]).map(async (device) => {
      const payload = {
        to: device.push_token,
        priority: 'high',
        notification: {
          title: `Aviso de conformidade — ${severityLabel}`,
          body:
            violation.description ??
            `Violação da política "${violation.policy_name ?? 'sem nome'}" foi registrada. Toque para revisar.`,
          sound: 'default',
        },
        data: {
          alert_type: 'violation_ack',
          violation_id: violation.id,
          policy_name: violation.policy_name ?? '',
          severity: violation.severity ?? 'medium',
          violation_type: violation.violation_type ?? '',
          requires_acknowledgment: 'true',
          ack_endpoint: `${SUPABASE_URL}/functions/v1/acknowledge-violation`,
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
        const data = await res.json().catch(() => ({}));
        return { device_id: device.id, ok: res.ok, status: res.status, response: data };
      } catch (e) {
        return { device_id: device.id, ok: false, error: (e as Error).message };
      }
    }),
  );

  const delivered = results.filter((r) => r.ok).length;

  // Marca notificado no lado do servidor
  if (delivered > 0 && !violation.employee_notified_at) {
    await supabase
      .from('security_violations')
      .update({ employee_notified_at: new Date().toISOString() })
      .eq('id', violation.id);
  }

  // Trilha de auditoria
  await supabase.from('settings_audit_log').insert({
    action: 'mobile_violation_notification_sent',
    entity_type: 'security_violations',
    entity_id: violation.id,
    metadata: {
      delivered,
      total_devices: devices.length,
      results,
      severity: violation.severity,
    } as any,
  });

  return json({
    ok: true,
    violation_id: violation.id,
    devices_total: devices.length,
    delivered,
    results,
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
