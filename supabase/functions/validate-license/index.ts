import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { licenseKey } = await req.json();
  
  const { data: license } = await supabase.from('licenses').select('*').eq('key', licenseKey).single();
  
  if (!license) return new Response(JSON.stringify({ valid: false, error: 'Invalid license' }), { status: 400 });
  if (new Date(license.expires_at) < new Date()) return new Response(JSON.stringify({ valid: false, error: 'License expired' }), { status: 400 });
  
  return new Response(JSON.stringify({ valid: true, plan: license.plan, expiresAt: license.expires_at }), { headers: { 'Content-Type': 'application/json' } });
});