import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const { data: activities } = await supabase.from('activities').select('*').gte('created_at', yesterday);
  const { data: violations } = await supabase.from('violations').select('*').gte('created_at', yesterday);
  
  const summary = {
    date: yesterday,
    totalActivities: activities?.length || 0,
    totalViolations: violations?.length || 0,
  };
  
  await supabase.from('daily_summaries').insert(summary);
  return new Response(JSON.stringify(summary), { headers: { 'Content-Type': 'application/json' } });
});