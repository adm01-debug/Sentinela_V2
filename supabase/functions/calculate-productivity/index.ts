import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { employeeName, startDate, endDate } = await req.json();

    if (!employeeName) {
      return new Response(JSON.stringify({ error: "employeeName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get productivity logs
    const { data: prodLogs, error: e1 } = await supabase
      .from("productivity_logs")
      .select("*")
      .eq("employee_name", employeeName)
      .gte("recorded_date", startDate)
      .lte("recorded_date", endDate);

    if (e1) throw e1;

    // Get keystroke logs
    const { data: keyLogs, error: e2 } = await supabase
      .from("keystroke_logs")
      .select("*")
      .eq("employee_name", employeeName)
      .gte("recorded_at", startDate)
      .lte("recorded_at", endDate);

    if (e2) throw e2;

    const totalProductive =
      prodLogs?.reduce((s, r) => s + (r.productive_time_seconds || 0), 0) || 0;
    const totalUnproductive =
      prodLogs?.reduce((s, r) => s + (r.unproductive_time_seconds || 0), 0) || 0;
    const totalNeutral = prodLogs?.reduce((s, r) => s + (r.neutral_time_seconds || 0), 0) || 0;
    const totalTime = totalProductive + totalUnproductive + totalNeutral;
    const productivityScore = totalTime > 0 ? Math.round((totalProductive / totalTime) * 100) : 0;

    const totalKeystrokes = keyLogs?.reduce((s, r) => s + (r.keystrokes_count || 0), 0) || 0;
    const totalActiveTime = keyLogs?.reduce((s, r) => s + (r.active_time_seconds || 0), 0) || 0;
    const totalIdleTime = keyLogs?.reduce((s, r) => s + (r.idle_time_seconds || 0), 0) || 0;

    // Extract top apps from productivity_logs.apps_used
    const appUsage: Record<string, number> = {};
    for (const log of prodLogs || []) {
      if (log.apps_used && typeof log.apps_used === "object") {
        for (const [app, seconds] of Object.entries(log.apps_used as Record<string, number>)) {
          appUsage[app] = (appUsage[app] || 0) + (seconds || 0);
        }
      }
    }

    const topApplications = Object.entries(appUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, duration]) => ({ name, duration }));

    return new Response(
      JSON.stringify({
        employeeName,
        productivityScore,
        totalProductive,
        totalUnproductive,
        totalNeutral,
        totalKeystrokes,
        totalActiveTime,
        totalIdleTime,
        topApplications,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
