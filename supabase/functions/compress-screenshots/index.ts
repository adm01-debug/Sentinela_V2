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
    const { screenshotId, batchMode = false } = await req.json();

    if (batchMode) {
      // Compress all uncompressed screenshots older than 24h
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: uncompressed } = await supabase
        .from('screen_captures')
        .select('id')
        .lt('captured_at', cutoff)
        .is('compressed', null)
        .limit(100);

      if (uncompressed && uncompressed.length > 0) {
        const ids = uncompressed.map(s => s.id);
        await supabase.from('screen_captures').update({ compressed: true }).in('id', ids);
        return new Response(JSON.stringify({ success: true, compressed: ids.length }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true, compressed: 0, message: 'No uncompressed screenshots found' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!screenshotId) return new Response(JSON.stringify({ error: 'screenshotId required' }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: screenshot, error: fetchErr } = await supabase
      .from('screen_captures')
      .select('*')
      .eq('id', screenshotId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!screenshot) return new Response(JSON.stringify({ error: 'Screenshot not found' }), 
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    await supabase.from('screen_captures').update({ compressed: true }).eq('id', screenshotId);

    return new Response(JSON.stringify({ success: true, screenshotId }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
