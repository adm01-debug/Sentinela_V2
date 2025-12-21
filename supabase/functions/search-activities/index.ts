import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { query, employeeId, startDate, endDate, page = 1, limit = 20 } = await req.json();
  
  let q = supabase.from('activities').select('*', { count: 'exact' });
  if (query) q = q.ilike('app_name', '%' + query + '%');
  if (employeeId) q = q.eq('employee_id', employeeId);
  if (startDate) q = q.gte('created_at', startDate);
  if (endDate) q = q.lte('created_at', endDate);
  
  const { data, count } = await q.range((page - 1) * limit, page * limit - 1).order('created_at', { ascending: false });
  
  return new Response(JSON.stringify({ data, total: count, page, pages: Math.ceil((count || 0) / limit) }), { headers: { 'Content-Type': 'application/json' } });
});