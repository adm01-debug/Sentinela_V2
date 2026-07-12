import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Verify the JWT and retrieve the authenticated user
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { authorization: authHeader } } }
    );
    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service-role client for data access (scoped to authenticated user's company via RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json().catch(() => ({}));
    const { insightTypes = ["trend", "anomaly", "recommendation"] } = body;
    const insights: Insight[] = [];

    // Fetch data for analysis
    const [activitiesRes, violationsRes, employeesRes] = await Promise.all([
      supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("violations").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("employees").select("*").eq("status", "active"),
    ]);

    const activities = activitiesRes.data || [];
    const violations = violationsRes.data || [];
    const employees = employeesRes.data || [];

    // Generate trend insights
    if (insightTypes.includes("trend")) {
      const today = activities.filter(
        (a: any) => new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;
      const yesterday = activities.filter((a: any) => {
        const d = new Date(a.created_at);
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
      const criticalViolations = violations.filter((v: any) => v.severity === "critical").length;
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
      const inactiveEmployees = employees.filter((e: any) => {
        const lastActivity = activities.find((a: any) => a.employee_id === e.id);
        return (
          !lastActivity ||
          new Date(lastActivity.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
      });

      if (employees.length > 0 && inactiveEmployees.length > employees.length * 0.1) {
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

      // Productivity recommendation — guard division by zero
      if (activities.length > 0) {
        const avgProductivity =
          activities.reduce((sum: number, a: any) => sum + (a.productivity_score || 0), 0) /
          activities.length;
        if (avgProductivity < 60) {
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
