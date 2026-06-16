import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [keystrokeLogs, violations, employees, productivityLogs] = await Promise.all([
      supabase.from('keystroke_logs').select('id', { count: 'exact' }).gte('recorded_at', weekAgo),
      supabase.from('security_violations').select('id', { count: 'exact' }).gte('created_at', weekAgo),
      supabase.from('employees').select('id', { count: 'exact' }),
      supabase.from('productivity_logs').select('id', { count: 'exact' }).gte('recorded_date', weekAgo),
    ]);

    const report = {
      report_type: 'weekly_summary',
      summary: `Relatório semanal: ${keystrokeLogs.count || 0} registros de atividade, ${violations.count || 0} violações, ${employees.count || 0} funcionários ativos.`,
      insights: {
        period: 'weekly',
        keystroke_records: keystrokeLogs.count || 0,
        violations_count: violations.count || 0,
        employees_count: employees.count || 0,
        productivity_records: productivityLogs.count || 0,
      },
      recommendations: null,
      risk_score: null,
      analysis_period_start: weekAgo,
      analysis_period_end: new Date().toISOString(),
    };

    await supabase.from('ai_analysis_reports').insert(report);

    return new Response(
      JSON.stringify(report),
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
