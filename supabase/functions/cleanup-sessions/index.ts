import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    
    // Clean up session recordings older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: expiredSessions, error: fetchErr } = await supabase
      .from('session_recordings')
      .select('id')
      .lt('created_at', thirtyDaysAgo);

    if (fetchErr) throw fetchErr;

    let cleaned = 0;
    if (expiredSessions && expiredSessions.length > 0) {
      const ids = expiredSessions.map(s => s.id);
      const { error: delErr } = await supabase
        .from('session_recordings')
        .delete()
        .in('id', ids);
      if (delErr) throw delErr;
      cleaned = ids.length;
    }

    // Also clean expired WebAuthn challenges
    await supabase.rpc('cleanup_expired_webauthn_challenges');

    // Clean old rate limit logs
    await supabase.rpc('cleanup_rate_limit_logs');

    return new Response(JSON.stringify({ 
      cleaned, 
      expiredBefore: thirtyDaysAgo,
      additionalCleanups: ['webauthn_challenges', 'rate_limit_logs'],
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
