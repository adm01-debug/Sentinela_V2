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

    const { type, startDate, endDate } = await req.json();

    const reportData: Record<string, unknown> = {};

    if (type === "productivity") {
      const { data, count } = await supabase
        .from("productivity_logs")
        .select(
          "employee_name, productive_time_seconds, unproductive_time_seconds, neutral_time_seconds, apps_used",
          { count: "exact" }
        )
        .gte("recorded_date", startDate)
        .lte("recorded_date", endDate);

      const totalProductive = data?.reduce((s, r) => s + (r.productive_time_seconds || 0), 0) || 0;
      const totalUnproductive =
        data?.reduce((s, r) => s + (r.unproductive_time_seconds || 0), 0) || 0;

      reportData.records = count || 0;
      reportData.total_productive_seconds = totalProductive;
      reportData.total_unproductive_seconds = totalUnproductive;
      reportData.productivity_ratio =
        totalProductive + totalUnproductive > 0
          ? Math.round((totalProductive / (totalProductive + totalUnproductive)) * 100)
          : 0;
    } else if (type === "violations") {
      const { data, count } = await supabase
        .from("security_violations")
        .select("*", { count: "exact" })
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      reportData.totalViolations = count || 0;
      reportData.violations = data;
    } else if (type === "activity") {
      const { data, count } = await supabase
        .from("keystroke_logs")
        .select("employee_name, keystrokes_count, active_time_seconds, idle_time_seconds", {
          count: "exact",
        })
        .gte("recorded_at", startDate)
        .lte("recorded_at", endDate);

      reportData.records = count || 0;
      reportData.total_keystrokes = data?.reduce((s, r) => s + (r.keystrokes_count || 0), 0) || 0;
      reportData.total_active_seconds =
        data?.reduce((s, r) => s + (r.active_time_seconds || 0), 0) || 0;
    }

    const report = {
      report_type: type,
      summary: `Relatório ${type} de ${startDate} a ${endDate}`,
      insights: reportData,
      analysis_period_start: startDate,
      analysis_period_end: endDate,
    };

    const { error } = await supabase.from("ai_analysis_reports").insert(report);
    if (error) throw error;

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
