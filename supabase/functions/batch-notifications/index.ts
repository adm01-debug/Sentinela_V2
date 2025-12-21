import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { notifications } = await req.json();
  
  const results = await Promise.allSettled(
    notifications.map(async (n: any) => {
      await supabase.from('notifications').insert(n);
      return { userId: n.user_id, status: 'sent' };
    })
  );
  
  return new Response(JSON.stringify({ results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason }) }), 
    { headers: { 'Content-Type': 'application/json' } });
});