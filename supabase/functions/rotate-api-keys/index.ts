import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { keyId } = await req.json();
  
  const newKey = 'sk_' + crypto.randomUUID().replace(/-/g, '');
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(newKey));
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  await supabase.from('api_keys').update({ key_hash: hashHex, last_four: newKey.slice(-4), rotated_at: new Date().toISOString() }).eq('id', keyId);
  
  return new Response(JSON.stringify({ key: newKey }), { headers: { 'Content-Type': 'application/json' } });
});