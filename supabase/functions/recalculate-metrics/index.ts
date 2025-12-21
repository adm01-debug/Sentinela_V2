import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { employeeId, period = '30d' } = await req.json();
  
  const days = parseInt(period);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: activities } = await supabase.from('activities').select('duration').eq('employee_id', employeeId).gte('created_at', since);
  
  const totalTime = activities?.reduce((sum, a) => sum + (a.duration || 0), 0) || 0;
  
  await supabase.from('employee_metrics').upsert({ employee_id: employeeId, total_time: totalTime, period, updated_at: new Date().toISOString() });
  
  return new Response(JSON.stringify({ employeeId, totalTime }), { headers: { 'Content-Type': 'application/json' } });
});