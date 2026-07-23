import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agent-key',
};

const BodySchema = z.object({
  violation_id: z.string().uuid(),
  action: z.enum(['notified', 'acknowledged']),
  reason: z.string().max(2000).optional(),
  device: z.string().max(200).optional(),
});

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const agentKey = req.headers.get('x-agent-key');
    if (!agentKey) {
      return new Response(JSON.stringify({ error: 'Missing x-agent-key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const { violation_id, action, reason, device } = parsed.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Validate agent key
    const { data: keyRow, error: keyErr } = await supabase
      .from('agent_keys')
      .select('id, company_id, employee_name, is_active')
      .eq('agent_key', agentKey)
      .maybeSingle();

    if (keyErr || !keyRow || !keyRow.is_active) {
      return new Response(JSON.stringify({ error: 'Invalid agent key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load violation and enforce tenant + employee ownership
    const { data: violation, error: vErr } = await supabase
      .from('security_violations')
      .select('id, company_id, employee_name, employee_acknowledged_at')
      .eq('id', violation_id)
      .maybeSingle();

    if (vErr || !violation) {
      return new Response(JSON.stringify({ error: 'Violation not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (
      violation.company_id !== keyRow.company_id ||
      (violation.employee_name && keyRow.employee_name &&
        violation.employee_name !== keyRow.employee_name)
    ) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';

    const now = new Date().toISOString();
    const update: Record<string, unknown> = {};

    if (action === 'notified') {
      update.employee_notified_at = now;
      update.notified_employee = true;
    } else {
      // acknowledged
      if (violation.employee_acknowledged_at) {
        return new Response(
          JSON.stringify({ success: true, already_acknowledged: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      const signature = await sha256Hex(
        `${violation_id}|${keyRow.employee_name ?? ''}|${keyRow.company_id}|${now}`,
      );
      update.employee_acknowledged_at = now;
      update.employee_ack_reason = reason ?? null;
      update.employee_ack_signature = signature;
      update.employee_ack_ip = ip;
      update.employee_ack_device = device ?? null;
      if (!violation.employee_acknowledged_at) update.notified_employee = true;
    }

    const { error: uErr } = await supabase
      .from('security_violations')
      .update(update)
      .eq('id', violation_id);

    if (uErr) throw uErr;

    // Audit trail
    await supabase.from('settings_audit_log').insert({
      action:
        action === 'notified' ? 'violation_notified_employee' : 'violation_acknowledged',
      entity_type: 'security_violation',
      entity_id: violation_id,
      entity_name: violation.employee_name,
      user_id: '00000000-0000-0000-0000-000000000000',
      user_email: `agent:${keyRow.employee_name ?? 'unknown'}`,
      new_value: { ...update, ip, agent_key_id: keyRow.id },
    });

    return new Response(
      JSON.stringify({ success: true, signature: update.employee_ack_signature ?? null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('acknowledge-violation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
