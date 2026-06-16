import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { employeeId, employeeName, date } = await req.json();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const name = employeeName || employeeId;

    const [keystrokes, clicks, violations, screenshots] = await Promise.all([
      supabase
        .from("keystroke_logs")
        .select("*")
        .eq("employee_name", name)
        .gte("recorded_at", startOfDay.toISOString())
        .lte("recorded_at", endOfDay.toISOString())
        .order("recorded_at")
        .limit(100),
      supabase
        .from("click_logs")
        .select("*")
        .eq("employee_name", name)
        .gte("recorded_at", startOfDay.toISOString())
        .lte("recorded_at", endOfDay.toISOString())
        .order("recorded_at")
        .limit(100),
      supabase
        .from("security_violations")
        .select("*")
        .eq("employee_id", employeeId)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString())
        .order("created_at"),
      supabase
        .from("screen_captures")
        .select("id, captured_at, thumbnail_url")
        .eq("employee_id", employeeId)
        .gte("captured_at", startOfDay.toISOString())
        .lte("captured_at", endOfDay.toISOString())
        .order("captured_at")
        .limit(50),
    ]);

    return new Response(
      JSON.stringify({
        date,
        employeeId,
        keystrokes: keystrokes.data ?? [],
        clicks: clicks.data ?? [],
        violations: violations.data ?? [],
        screenshots: screenshots.data ?? [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
