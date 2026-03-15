import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'get-policies', 30, 60);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const url = new URL(req.url);
    const enabledOnly = url.searchParams.get('enabled_only') === 'true';
    const category = url.searchParams.get('category') || undefined;
    const employeeName = url.searchParams.get('employee_name') || undefined;

    // Query security_policies (real table)
    let query = supabase.from('security_policies').select('*');

    if (enabledOnly) {
      query = query.eq('enabled', true);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data: policies, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // Check acknowledgments if employee_name provided
    let acknowledgments: Record<string, boolean> = {};
    if (employeeName && policies) {
      const { data: acks } = await supabase
        .from('policy_acknowledgments')
        .select('policy_version, acknowledged_at')
        .eq('employee_name', employeeName);

      if (acks) {
        for (const ack of acks) {
          if (ack.policy_version) {
            acknowledgments[ack.policy_version] = true;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        policies: policies?.map(p => ({
          ...p,
          acknowledged: employeeName ? !!acknowledgments[p.id] : undefined,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
