import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { token } = await req.json();
  
  const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: 'email' });
  if (error) return new Response(JSON.stringify({ verified: false, error: error.message }), { status: 400 });
  
  return new Response(JSON.stringify({ verified: true }), { headers: { 'Content-Type': 'application/json' } });
});