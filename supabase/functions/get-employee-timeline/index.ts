import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireServiceRole } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    await requireServiceRole(req);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body = await req.json().catch(() => ({}));
    const { employeeId, employeeName } = body ?? {};
    const date = body?.date ?? body?.day ?? new Date().toISOString().slice(0, 10);

    if (Number.isNaN(new Date(date).getTime())) {
      return new Response(JSON.stringify({ error: 'invalid date' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // As tabelas de telemetria vinculam por employee_name (não há FK para employees).
    let name = employeeName as string | undefined;
    if (!name && employeeId) {
      const { data: emp } = await supabase
        .from('employees')
        .select('name')
        .eq('id', employeeId)
        .maybeSingle();
      name = emp?.name ?? employeeId;
    }
    if (!name) {
      return new Response(JSON.stringify({ error: 'employeeId or employeeName required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const [keystrokes, clicks, violations, screenshots] = await Promise.all([
      supabase.from('keystroke_logs').select('*')
        .eq('employee_name', name)
        .gte('recorded_at', startOfDay.toISOString())
        .lte('recorded_at', endOfDay.toISOString())
        .order('recorded_at').limit(100),
      supabase.from('click_logs').select('*')
        .eq('employee_name', name)
        .gte('recorded_at', startOfDay.toISOString())
        .lte('recorded_at', endOfDay.toISOString())
        .order('recorded_at').limit(100),
      supabase.from('security_violations').select('*')
        .eq('employee_name', name)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at'),
      supabase.from('screen_captures').select('id, captured_at, capture_url, app_name, window_title')
        .eq('employee_name', name)
        .gte('captured_at', startOfDay.toISOString())
        .lte('captured_at', endOfDay.toISOString())
        .order('captured_at').limit(50),
    ]);

    return new Response(JSON.stringify({
      date,
      employeeId,
      keystrokes: keystrokes.data ?? [],
      clicks: clicks.data ?? [],
      violations: violations.data ?? [],
      screenshots: screenshots.data ?? [],
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
