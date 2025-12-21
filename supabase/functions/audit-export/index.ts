import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { startDate, endDate, format = 'json' } = await req.json();
  
  const { data, error } = await supabase.from('audit_logs').select('*')
    .gte('created_at', startDate).lte('created_at', endDate).order('created_at', { ascending: false });
  
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  
  if (format === 'csv') {
    const csv = [Object.keys(data[0] || {}).join(','), ...data.map(r => Object.values(r).join(','))].join('\n');
    return new Response(csv, { headers: { 'Content-Type': 'text/csv' } });
  }
  
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
});