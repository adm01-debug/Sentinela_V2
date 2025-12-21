import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { days = 90 } = await req.json();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase.from('activities').select('*').lt('created_at', cutoff);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  
  // Archive to storage
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  await supabase.storage.from('archives').upload(\`activities-\${Date.now()}.json\`, blob);
  
  // Delete archived data
  await supabase.from('activities').delete().lt('created_at', cutoff);
  
  return new Response(JSON.stringify({ archived: data?.length || 0 }), { headers: { 'Content-Type': 'application/json' } });
});