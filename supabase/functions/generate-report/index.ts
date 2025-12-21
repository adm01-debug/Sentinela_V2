import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, startDate, endDate, employeeIds } = await req.json();

    const report: Record<string, unknown> = {
      type,
      generatedAt: new Date().toISOString(),
      period: { startDate, endDate },
      data: {},
    };

    if (type === 'productivity') {
      const { data } = await supabase
        .from('activity_logs')
        .select('employee_id, duration, type')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      report.data = { activities: data?.length || 0 };
    } else if (type === 'violations') {
      const { data } = await supabase
        .from('violations')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      report.data = { totalViolations: data?.length || 0, violations: data };
    }

    const { error } = await supabase.from('reports').insert({
      type,
      data: report,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return new Response(
      JSON.stringify(report),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
