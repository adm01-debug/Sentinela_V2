import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KeystrokeRow {
  employee_name: string;
  recorded_at: string | null;
  created_at: string;
  active_time_seconds: number | null;
  idle_time_seconds: number | null;
}

interface EmployeeRow {
  id: string;
  name: string;
}

interface ViolationRow {
  severity?: string | null;
}

interface Insight {
  id: string;
  type: "trend" | "anomaly" | "recommendation" | "prediction";
  title: string;
  description: string;
  confidence: number;
  severity?: "low" | "medium" | "high";
  data?: Record<string, any>;
  actions?: string[];
  createdAt: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller — reject unauthenticated requests
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the JWT against the Auth API (getUser sem token nao autentica)
    const userRes = await fetch(`${Deno.env.get("SUPABASE_URL") ?? ""}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      },
    });
    const user = userRes.ok ? await userRes.json() : null;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role ignora RLS, entao as consultas abaixo devolviam dados de todas
    // as empresas para qualquer usuario logado. O client com o JWT do chamador
    // respeita as policies de tenant (company_id) e de papel.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { insightTypes = ["trend", "anomaly", "recommendation"] } = await req.json();
    const insights: Insight[] = [];

    // Fetch data for analysis
    const [activitiesRes, violationsRes, employeesRes] = await Promise.all([
      supabase
        .from("keystroke_logs")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(500),
      supabase
        .from("security_violations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("employees").select("*").eq("status", "active"),
    ]);

    const activities = (activitiesRes.data || []) as KeystrokeRow[];
    const violations = (violationsRes.data || []) as ViolationRow[];
    const employees = (employeesRes.data || []) as EmployeeRow[];

    // Generate trend insights
    if (insightTypes.includes("trend")) {
      // Activity trend
      const today = activities.filter(
        (a) => new Date(a.recorded_at ?? a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;
      const yesterday = activities.filter((a) => {
        const d = new Date(a.recorded_at ?? a.created_at);
        return (
          d > new Date(Date.now() - 48 * 60 * 60 * 1000) &&
          d < new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
      }).length;

      if (yesterday > 0) {
        const change = ((today - yesterday) / yesterday) * 100;
        if (Math.abs(change) > 20) {
          insights.push({
            id: crypto.randomUUID(),
            type: "trend",
            title: change > 0 ? "Activity Increase Detected" : "Activity Decrease Detected",
            description: `Activity ${change > 0 ? "increased" : "decreased"} by ${Math.abs(change).toFixed(1)}% compared to yesterday`,
            confidence: 0.85,
            severity: Math.abs(change) > 50 ? "high" : "medium",
            data: { today, yesterday, changePercent: change },
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // Generate anomaly insights
    if (insightTypes.includes("anomaly")) {
      const criticalViolations = violations.filter(
        (v: ViolationRow) => v.severity === "critical"
      ).length;
      if (criticalViolations > 5) {
        insights.push({
          id: crypto.randomUUID(),
          type: "anomaly",
          title: "High Number of Critical Violations",
          description: `${criticalViolations} critical violations detected recently. Immediate attention required.`,
          confidence: 0.95,
          severity: "high",
          data: { count: criticalViolations },
          actions: [
            "Review critical violations immediately",
            "Check security policies",
            "Contact affected users",
          ],
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Generate recommendations
    if (insightTypes.includes("recommendation")) {
      const activeUserNames = new Set(activities.map((a) => a.employee_name));
      const inactiveEmployees = employees.filter((e) => !activeUserNames.has(e.name));

      if (inactiveEmployees.length > employees.length * 0.1) {
        insights.push({
          id: crypto.randomUUID(),
          type: "recommendation",
          title: "Review Inactive Employees",
          description: `${inactiveEmployees.length} employees (${((inactiveEmployees.length / employees.length) * 100).toFixed(1)}%) have no recent activity`,
          confidence: 0.8,
          data: { inactiveCount: inactiveEmployees.length, totalEmployees: employees.length },
          actions: [
            "Verify employee status",
            "Check agent installation",
            "Review monitoring policies",
          ],
          createdAt: new Date().toISOString(),
        });
      }

      // Productivity recommendation
      const avgProductivity =
        activities.reduce((sum: number, a) => {
          const active = Number(a.active_time_seconds ?? 0);
          const idle = Number(a.idle_time_seconds ?? 0);
          return sum + (active + idle > 0 ? (active / (active + idle)) * 100 : 0);
        }, 0) / Math.max(activities.length, 1);
      if (avgProductivity > 0 && avgProductivity < 60) {
        insights.push({
          id: crypto.randomUUID(),
          type: "recommendation",
          title: "Productivity Improvement Opportunity",
          description: `Average productivity score is ${avgProductivity.toFixed(1)}%. Consider reviewing workflows.`,
          confidence: 0.75,
          data: { avgProductivity },
          actions: [
            "Analyze low-productivity periods",
            "Review application usage",
            "Identify bottlenecks",
          ],
          createdAt: new Date().toISOString(),
        });
      }
    }

    return new Response(
      JSON.stringify({
        insights,
        metadata: {
          analyzedActivities: activities.length,
          analyzedViolations: violations.length,
          analyzedEmployees: employees.length,
          generatedAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
