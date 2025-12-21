import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { employeeId, date } = await req.json();
  
  const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);
  
  const { data } = await supabase.from('activities').select('*')
    .eq('employee_id', employeeId)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())
    .order('created_at');
  
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
});