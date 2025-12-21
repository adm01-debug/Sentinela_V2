import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { employees } = await req.json();
  
  const results = { success: 0, failed: 0, errors: [] as string[] };
  
  for (const emp of employees) {
    const { error } = await supabase.from('employees').insert(emp);
    if (error) { results.failed++; results.errors.push(error.message); }
    else results.success++;
  }
  
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
});