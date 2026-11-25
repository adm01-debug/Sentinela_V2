import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callerClient,
  callerCompanyId,
  companyScope,
  requireUserOrServiceRole,
  withCompanyScope,
} from "../_shared/auth.ts";
import { canAccessReport } from "../_shared/reportAccess.ts";

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
  let auth: Awaited<ReturnType<typeof requireUserOrServiceRole>>;
  try {
    auth = await requireUserOrServiceRole(req);
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

    // Tenant oficial do chamador (mesma fonte das policies). Chamador interno
    // (service_role) nao recebe filtro: e cron/interno e varre todas as empresas.
    const callerCompany = await callerCompanyId(supabase, auth);
    const scope = auth.isServiceRole ? null : companyScope(callerCompany);

    const body = await req.json();
    // Contratos do front: { reportId } (useReportsPage), { report_id } (useScheduledReportsPage),
    // { name, type, description } (CustomReportsPage) e o legado { type, startDate, endDate }.
    let type: string | undefined = body.type;
    let startDate: string | undefined = body.startDate;
    let endDate: string | undefined = body.endDate;
    const reportId: string | undefined = body.reportId ?? body.report_id;

    if (reportId) {
      const { data: row, error: rowError } = await supabase
        .from('reports')
        .select('type, requested_by')
        .eq('id', reportId)
        .maybeSingle();
      if (rowError) throw rowError;
      if (!row) {
        return new Response(JSON.stringify({ error: 'Relatorio nao encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // A RLS de `reports` deixa o admin ver todos e o solicitante ver o seu; a
      // edge roda com service_role, entao a mesma regra e aplicada aqui.
      let isAdmin = false;
      let requesterCompany: string | null = null;
      if (!auth.isServiceRole && auth.user && row.requested_by !== auth.user.id) {
        const { data: adminFlag } = await supabase.rpc('has_role', {
          _user_id: auth.user.id,
          _role: 'admin',
        });
        isAdmin = adminFlag === true;
        if (isAdmin && row.requested_by) {
          requesterCompany = await callerCompanyId(supabase, {
            user: { id: row.requested_by },
            isServiceRole: false,
          });
        }
      }

      const allowed = canAccessReport({
        isServiceRole: auth.isServiceRole,
        callerUserId: auth.user?.id ?? null,
        isAdmin,
        callerCompanyId: callerCompany,
        requestedBy: row.requested_by ?? null,
        requesterCompanyId: requesterCompany,
      });
      if (!allowed) {
        return new Response(JSON.stringify({ error: 'Sem acesso a este relatorio' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!type) type = row.type ?? undefined;
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
      const { data, count } = await withCompanyScope(
        supabase
          .from("productivity_logs")
          .select(
            "employee_name, productive_time_seconds, unproductive_time_seconds, neutral_time_seconds, apps_used",
            { count: "exact" }
          )
          .gte("recorded_date", startDate)
          .lte("recorded_date", endDate),
        scope
      );

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
      const { data, count } = await withCompanyScope(
        supabase
          .from("security_violations")
          .select("*", { count: "exact" })
          .gte("created_at", startDate)
          .lte("created_at", endDate),
        scope
      );

      reportData.totalViolations = count || 0;
      reportData.violations = data;
    } else if (type === 'activity' || type === 'keystroke') {
      const { data, count } = await withCompanyScope(
        supabase
          .from("keystroke_logs")
          .select("employee_name, keystrokes_count, active_time_seconds, idle_time_seconds", {
            count: "exact",
          })
          .gte("recorded_at", startDate)
          .lte("recorded_at", endDate),
        scope
      );

      reportData.records = count || 0;
      reportData.total_keystrokes = data?.reduce((s, r) => s + (r.keystrokes_count || 0), 0) || 0;
      reportData.total_active_seconds =
        data?.reduce((s, r) => s + (r.active_time_seconds || 0), 0) || 0;
    } else if (type === "attendance") {
      // attendance_records nao tem company_id; a policy escopa pelo join com
      // employees. Para o usuario usamos o client dele (RLS vale); chamador
      // interno segue no service_role.
      const attendanceClient = auth.isServiceRole ? supabase : callerClient(req);
      const { data, count } = await attendanceClient
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
        withCompanyScope(
          supabase
            .from("productivity_logs")
            .select("productive_time_seconds, unproductive_time_seconds", { count: "exact" })
            .gte("recorded_date", startDate)
            .lte("recorded_date", endDate),
          scope
        ),
        withCompanyScope(
          supabase
            .from("security_violations")
            .select("id", { count: "exact" })
            .gte("created_at", startDate)
            .lte("created_at", endDate),
          scope
        ),
        withCompanyScope(
          supabase
            .from("keystroke_logs")
            .select("keystrokes_count", { count: "exact" })
            .gte("recorded_at", startDate)
            .lte("recorded_at", endDate),
          scope
        ),
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
