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
    const { email } = await req.json();

    if (!email) return new Response(JSON.stringify({ error: 'email required' }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const appUrl = Deno.env.get('APP_URL') || Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.supabase.co');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Log password reset request
    await supabase.from('login_security_events').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      event_type: 'password_reset_requested',
      metadata: { email },
    });

    return new Response(JSON.stringify({ success: true, message: 'Password reset email sent' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
