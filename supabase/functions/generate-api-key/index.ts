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
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { key_name, device_name, employee_name } = await req.json();
    if (!key_name) return new Response(JSON.stringify({ error: 'key_name required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Generate a unique agent key
    const agentKey = 'ak_' + crypto.randomUUID().replace(/-/g, '');

    // Get user's company
    const { data: companyId } = await supabase.rpc('get_user_company_id', { p_user_id: user.id });

    const { data, error } = await supabase.from('agent_keys').insert({
      key_name,
      agent_key: agentKey,
      device_name: device_name || null,
      employee_name: employee_name || null,
      created_by: user.id,
      company_id: companyId || null,
      is_active: true,
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, key: agentKey, id: data.id }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
