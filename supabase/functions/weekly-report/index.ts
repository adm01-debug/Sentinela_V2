import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const [activities, violations, employees] = await Promise.all([
    supabase.from('activities').select('id', { count: 'exact' }).gte('created_at', weekAgo),
    supabase.from('violations').select('id', { count: 'exact' }).gte('created_at', weekAgo),
    supabase.from('employees').select('id', { count: 'exact' }),
  ]);
  
  const report = {
    period: 'weekly',
    activities: activities.count,
    violations: violations.count,
    employees: employees.count,
    generatedAt: new Date().toISOString(),
  };
  
  await supabase.from('reports').insert(report);
  return new Response(JSON.stringify(report), { headers: { 'Content-Type': 'application/json' } });
});