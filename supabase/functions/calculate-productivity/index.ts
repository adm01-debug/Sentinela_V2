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

    const { employeeId, startDate, endDate } = await req.json();

    const { data: activities, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) throw error;

    const totalTime = activities?.reduce((sum, a) => sum + (a.duration || 0), 0) || 0;
    const activeTime = activities?.filter(a => a.type === 'active').reduce((sum, a) => sum + (a.duration || 0), 0) || 0;
    const productivityScore = totalTime > 0 ? Math.round((activeTime / totalTime) * 100) : 0;

    const topApps = activities?.reduce((acc, a) => {
      if (a.application_name) {
        acc[a.application_name] = (acc[a.application_name] || 0) + (a.duration || 0);
      }
      return acc;
    }, {} as Record<string, number>) || {};

    return new Response(
      JSON.stringify({
        employeeId,
        productivityScore,
        totalTime,
        activeTime,
        idleTime: totalTime - activeTime,
        topApplications: Object.entries(topApps)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, duration]) => ({ name, duration })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
