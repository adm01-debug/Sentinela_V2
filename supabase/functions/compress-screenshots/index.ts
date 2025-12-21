import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { screenshotId } = await req.json();
  
  const { data: screenshot } = await supabase.from('screenshots').select('*').eq('id', screenshotId).single();
  if (!screenshot) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  
  // Mark as compressed
  await supabase.from('screenshots').update({ compressed: true }).eq('id', screenshotId);
  
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
});