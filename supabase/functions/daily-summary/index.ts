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
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const [keystrokeRes, clickRes, violationRes, employeeRes] = await Promise.all([
      supabase.from('keystroke_logs').select('id', { count: 'exact' }).gte('recorded_at', yesterday).lt('recorded_at', today),
      supabase.from('click_logs').select('id', { count: 'exact' }).gte('recorded_at', yesterday).lt('recorded_at', today),
      supabase.from('security_violations').select('id', { count: 'exact' }).gte('created_at', yesterday).lt('created_at', today),
      supabase.from('employees').select('id', { count: 'exact' }).eq('status', 'active'),
    ]);

    const summary = {
      date: yesterday,
      activeEmployees: employeeRes.count ?? 0,
      totalKeystrokeLogs: keystrokeRes.count ?? 0,
      totalClickLogs: clickRes.count ?? 0,
      totalViolations: violationRes.count ?? 0,
      generatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(summary), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
