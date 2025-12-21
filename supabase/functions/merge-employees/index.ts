import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { keepId, mergeId } = await req.json();
  
  // Update references
  await supabase.from('activities').update({ employee_id: keepId }).eq('employee_id', mergeId);
  await supabase.from('violations').update({ employee_id: keepId }).eq('employee_id', mergeId);
  await supabase.from('screenshots').update({ employee_id: keepId }).eq('employee_id', mergeId);
  
  // Delete merged employee
  await supabase.from('employees').delete().eq('id', mergeId);
  
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
});