import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { name, scopes = ['read'] } = await req.json();
  
  const key = 'sk_' + crypto.randomUUID().replace(/-/g, '');
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  await supabase.from('api_keys').insert({ name, key_hash: hashHex, scopes, last_four: key.slice(-4) });
  
  return new Response(JSON.stringify({ key, scopes }), { headers: { 'Content-Type': 'application/json' } });
});