import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUserOrServiceRole } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let currentReportId: string | undefined;

  // verify_jwt = false no config.toml: sem este gate qualquer pessoa na
  // internet gera relatorios pelo service_role.
  try {
    await requireUserOrServiceRole(req);
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    // Contratos do front: { reportId } (useReportsPage), { report_id } (useScheduledReportsPage),
    // { name, type, description } (CustomReportsPage) e o legado { type, startDate, endDate }.
    let type: string | undefined = body.type;
    let startDate: string | undefined = body.startDate;
    let endDate: string | undefined = body.endDate;
    const reportId: string | undefined = body.reportId ?? body.report_id;

    if (reportId && !type) {
      const { data: row, error: rowError } = await supabase
        .from('reports')
        .select('type')
        .eq('id', reportId)
        .maybeSingle();
      if (rowError) throw rowError;
      type = row?.type ?? undefined;
    }

    if (!type) {
      return new Response(
        JSON.stringify({ error: 'Informe type ou um reportId/report_id valido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!startDate) {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      startDate = d.toISOString();
    }
    if (!endDate) {
      endDate = new Date().toISOString();
    }

    currentReportId = reportId;
    if (reportId) {
      await supabase.from('reports').update({ status: 'generating' }).eq('id', reportId);
    }

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
    } else if (type === 'activity' || type === 'keystroke') {
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
    } else if (type === "attendance") {
      const { data, count } = await supabase
        .from("attendance_records")
        .select(
          "employee_id, actual_start, actual_end, status, late_minutes, total_worked_minutes",
          { count: "exact" }
        )
        .gte("date", startDate)
        .lte("date", endDate);

      reportData.records = count || 0;
      reportData.attendance = data;
    } else if (type === "summary") {
      const [productivity, violations, keystrokes] = await Promise.all([
        supabase
          .from("productivity_logs")
          .select("productive_time_seconds, unproductive_time_seconds", { count: "exact" })
          .gte("recorded_date", startDate)
          .lte("recorded_date", endDate),
        supabase
          .from("security_violations")
          .select("id", { count: "exact" })
          .gte("created_at", startDate)
          .lte("created_at", endDate),
        supabase
          .from("keystroke_logs")
          .select("keystrokes_count", { count: "exact" })
          .gte("recorded_at", startDate)
          .lte("recorded_at", endDate),
      ]);

      const prod = productivity.data ?? [];
      const totalProductive = prod.reduce((s, r) => s + (r.productive_time_seconds || 0), 0);
      const totalUnproductive = prod.reduce((s, r) => s + (r.unproductive_time_seconds || 0), 0);

      reportData.productivity_records = productivity.count || 0;
      reportData.productivity_ratio =
        totalProductive + totalUnproductive > 0
          ? Math.round((totalProductive / (totalProductive + totalUnproductive)) * 100)
          : 0;
      reportData.total_violations = violations.count || 0;
      reportData.total_keystrokes = (keystrokes.data ?? []).reduce(
        (s, r) => s + (r.keystrokes_count || 0),
        0
      );
    }

    const report = {
      report_type: type,
      summary: body.name
        ? `Relatório ${body.name} (${type}) de ${startDate} a ${endDate}`
        : `Relatório ${type} de ${startDate} a ${endDate}`,
      insights: reportData,
      analysis_period_start: startDate,
      analysis_period_end: endDate,
    };

    const { error } = await supabase.from("ai_analysis_reports").insert(report);
    if (error) throw error;

    if (reportId) {
      const { error: updateError } = await supabase
        .from('reports')
        .update({ status: 'completed', file_url: null, error_message: null })
        .eq('id', reportId);
      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({ ...report, report_id: reportId ?? null, status: 'completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (currentReportId) {
      try {
        const admin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        await admin
          .from("reports")
          .update({ status: "failed", error_message: message })
          .eq("id", currentReportId);
      } catch {
        // best-effort
      }
    }
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
