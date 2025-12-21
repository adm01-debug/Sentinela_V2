import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { email, role = 'user' } = await req.json();
  
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  
  await supabase.from('user_roles').insert({ user_id: data.user.id, role });
  return new Response(JSON.stringify({ success: true, userId: data.user.id }), { headers: { 'Content-Type': 'application/json' } });
});