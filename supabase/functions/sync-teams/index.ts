import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  
  const { data: teams } = await supabase.from('teams').select('id');
  
  for (const team of teams || []) {
    const { count } = await supabase.from('employees').select('id', { count: 'exact' }).eq('team_id', team.id);
    await supabase.from('teams').update({ member_count: count }).eq('id', team.id);
  }
  
  return new Response(JSON.stringify({ synced: teams?.length || 0 }), { headers: { 'Content-Type': 'application/json' } });
});