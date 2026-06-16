import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { employeeId, period = '30' } = await req.json();

    const since = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();

    // Get employee
    const { data: employee } = await supabase.from('employees').select('id, name').eq('id', employeeId).single();
    if (!employee) return new Response(JSON.stringify({ error: 'Employee not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Aggregate keystroke data
    const { data: keystrokes } = await supabase.from('keystroke_logs')
      .select('keystrokes_count, active_time_seconds, idle_time_seconds')
      .eq('employee_name', employee.name)
      .gte('recorded_at', since);

    const totalKeystrokes = keystrokes?.reduce((sum, k) => sum + (k.keystrokes_count || 0), 0) ?? 0;
    const totalActiveTime = keystrokes?.reduce((sum, k) => sum + (k.active_time_seconds || 0), 0) ?? 0;
    const totalIdleTime = keystrokes?.reduce((sum, k) => sum + (k.idle_time_seconds || 0), 0) ?? 0;

    // Aggregate clicks
    const { count: totalClicks } = await supabase.from('click_logs')
      .select('id', { count: 'exact' })
      .eq('employee_name', employee.name)
      .gte('recorded_at', since);

    // Count violations
    const { count: totalViolations } = await supabase.from('security_violations')
      .select('id', { count: 'exact' })
      .eq('employee_id', employeeId)
      .gte('created_at', since);

    const productivityScore = totalActiveTime > 0 
      ? Math.round((totalActiveTime / (totalActiveTime + totalIdleTime)) * 100) 
      : 0;

    const metrics = {
      employeeId,
      period: `${period}d`,
      totalKeystrokes,
      totalClicks: totalClicks ?? 0,
      totalActiveTimeSeconds: totalActiveTime,
      totalIdleTimeSeconds: totalIdleTime,
      totalViolations: totalViolations ?? 0,
      productivityScore,
      calculatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(metrics), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
