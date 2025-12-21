import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { userId } = await req.json();
  
  // Delete user data (LGPD compliance)
  await supabase.from('activities').delete().eq('employee_id', userId);
  await supabase.from('screenshots').delete().eq('employee_id', userId);
  await supabase.from('violations').delete().eq('employee_id', userId);
  await supabase.from('employees').delete().eq('id', userId);
  
  return new Response(JSON.stringify({ success: true, userId }), { headers: { 'Content-Type': 'application/json' } });
});