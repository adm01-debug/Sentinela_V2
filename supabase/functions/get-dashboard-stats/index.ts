import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  
  const [employees, violations, activities] = await Promise.all([
    supabase.from('employees').select('id', { count: 'exact' }),
    supabase.from('violations').select('id', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0]),
    supabase.from('activities').select('id', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0]),
  ]);
  
  return new Response(JSON.stringify({
    totalEmployees: employees.count || 0,
    todayViolations: violations.count || 0,
    todayActivities: activities.count || 0,
  }), { headers: { 'Content-Type': 'application/json' } });
});