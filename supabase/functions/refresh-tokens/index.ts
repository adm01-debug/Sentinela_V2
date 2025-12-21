import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { refreshToken } = await req.json();
  
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  
  return new Response(JSON.stringify({ access_token: data.session?.access_token, expires_at: data.session?.expires_at }), { headers: { 'Content-Type': 'application/json' } });
});