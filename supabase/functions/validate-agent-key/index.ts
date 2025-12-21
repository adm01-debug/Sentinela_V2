import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { agentKey, deviceInfo } = await req.json();

    if (!agentKey) {
      throw new Error('Agent key is required');
    }

    const { data: key, error } = await supabase
      .from('agent_keys')
      .select('*, employees(*)')
      .eq('key', agentKey)
      .eq('status', 'active')
      .single();

    if (error || !key) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid or inactive agent key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase
      .from('agent_keys')
      .update({
        last_used_at: new Date().toISOString(),
        device_info: deviceInfo,
      })
      .eq('id', key.id);

    return new Response(
      JSON.stringify({
        valid: true,
        employee: key.employees,
        config: {
          screenshotInterval: key.screenshot_interval || 300,
          keystrokeLogging: key.keystroke_logging ?? true,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
