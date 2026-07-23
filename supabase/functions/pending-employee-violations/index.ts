import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agent-key',
};

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: keyRow } = await supabase
      .from('agent_keys')
      .select('company_id, employee_name, is_active')
      .eq('agent_key', agentKey)
      .maybeSingle();

    if (!keyRow || !keyRow.is_active) {
      return new Response(JSON.stringify({ error: 'Invalid agent key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Pending = never acknowledged; return latest 20 in the last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('security_violations')
      .select(
        'id, violation_type, severity, policy_name, description, created_at, employee_notified_at',
      )
      .eq('company_id', keyRow.company_id)
      .is('employee_acknowledged_at', null)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20);

    if (keyRow.employee_name) {
      query = query.eq('employee_name', keyRow.employee_name);
    }

    const { data, error } = await query;
    if (error) throw error;

    return new Response(JSON.stringify({ violations: data ?? [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('pending-employee-violations error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
