import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { query, employeeName, startDate, endDate, activityType = 'keystrokes', page = 1, limit = 20 } = await req.json();

    const offset = (page - 1) * limit;

    if (activityType === 'clicks') {
      let q = supabase.from('click_logs').select('*', { count: 'exact' });
      if (query) q = q.or(`app_name.ilike.%${query}%,window_title.ilike.%${query}%,target_element.ilike.%${query}%`);
      if (employeeName) q = q.eq('employee_name', employeeName);
      if (startDate) q = q.gte('recorded_at', startDate);
      if (endDate) q = q.lte('recorded_at', endDate);

      const { data, count, error } = await q.range(offset, offset + limit - 1).order('recorded_at', { ascending: false });
      if (error) throw error;

      return new Response(JSON.stringify({ data, total: count, page, pages: Math.ceil((count ?? 0) / limit) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Default: keystrokes
    let q = supabase.from('keystroke_logs').select('*', { count: 'exact' });
    if (query) q = q.ilike('app_name', `%${query}%`);
    if (employeeName) q = q.eq('employee_name', employeeName);
    if (startDate) q = q.gte('recorded_at', startDate);
    if (endDate) q = q.lte('recorded_at', endDate);

    const { data, count, error } = await q.range(offset, offset + limit - 1).order('recorded_at', { ascending: false });
    if (error) throw error;

    return new Response(JSON.stringify({ data, total: count, page, pages: Math.ceil((count ?? 0) / limit) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
