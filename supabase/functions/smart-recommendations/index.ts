import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUserOrServiceRole } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Recommendation {
  id: string;
  type: "policy" | "workflow" | "security" | "productivity" | "resource";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  priority: number;
  actions: string[];
  metrics?: Record<string, any>;
}

interface EmployeeRow {
  id: string;
  name: string;
}

interface ViolationRow {
  severity?: string | null;
  violation_type?: string | null;
  policy_name?: string | null;
}

interface KeystrokeRow {
  employee_name: string;
  app_name: string | null;
  active_time_seconds: number | null;
  idle_time_seconds: number | null;
  recorded_at: string | null;
  created_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // verify_jwt = true aceita a chave publicavel no gateway; o gate real
    // acontece aqui (ver _shared/auth.ts).
    try {
      await requireUserOrServiceRole(req);
    } catch {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { context = "general", limit = 10 } = await req.json();
    const recommendations: Recommendation[] = [];

    const [activitiesRes, violationsRes, employeesRes] = await Promise.all([
      supabase
        .from("keystroke_logs")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1000),
      supabase
        .from("security_violations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("employees").select("*").eq("status", "active"),
    ]);

    const activities = (activitiesRes.data || []) as KeystrokeRow[];
    const violations = (violationsRes.data || []) as ViolationRow[];
    const employees = (employeesRes.data || []) as EmployeeRow[];

    // Analyze violation patterns for policy recommendations
    const violationTypes: Record<string, number> = {};
    violations.forEach((v) => {
      const key = v.violation_type || v.policy_name || "sem_classificacao";
      violationTypes[key] = (violationTypes[key] || 0) + 1;
    });

    const topViolationType = Object.entries(violationTypes).sort((a, b) => b[1] - a[1])[0];
    if (topViolationType && topViolationType[1] > 10) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: "policy",
        title: `Address Frequent ${topViolationType[0]} Violations`,
        description: `${topViolationType[1]} violations of type "${topViolationType[0]}" detected. Consider updating policies.`,
        impact: "high",
        effort: "medium",
        priority: 90,
        actions: [
          "Review current policy for this violation type",
          "Communicate updated guidelines to employees",
          "Consider automated prevention measures",
        ],
        metrics: { violationCount: topViolationType[1], type: topViolationType[0] },
      });
    }

    // Productivity recommendations
    const productivityRatios = activities
      .map((a) => {
        const active = Number(a.active_time_seconds ?? 0);
        const idle = Number(a.idle_time_seconds ?? 0);
        return active + idle > 0 ? (active / (active + idle)) * 100 : null;
      })
      .filter((v): v is number => v !== null);
    const avgProductivity =
      productivityRatios.length > 0
        ? productivityRatios.reduce((a, b) => a + b, 0) / productivityRatios.length
        : 0;

    if (avgProductivity < 50) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: "productivity",
        title: "Low Overall Productivity Detected",
        description: `Average productivity is ${avgProductivity.toFixed(1)}%. Multiple areas need attention.`,
        impact: "high",
        effort: "high",
        priority: 85,
        actions: [
          "Identify top time-consuming non-productive applications",
          "Implement focus time policies",
          "Review and optimize workflows",
          "Consider productivity training",
        ],
        metrics: { avgProductivity },
      });
    }

    // Security recommendations
    const criticalViolations = violations.filter((v) => v.severity === "critical").length;
    const highViolations = violations.filter((v) => v.severity === "high").length;

    if (criticalViolations > 0 || highViolations > 5) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: "security",
        title: "Strengthen Security Measures",
        description: `${criticalViolations} critical and ${highViolations} high severity violations need attention.`,
        impact: "high",
        effort: "medium",
        priority: 95,
        actions: [
          "Review and address all critical violations immediately",
          "Implement stricter access controls",
          "Enable additional monitoring for sensitive operations",
          "Conduct security awareness training",
        ],
        metrics: { criticalViolations, highViolations },
      });
    }

    // Resource optimization
    const employeesWithLowActivity = employees.filter((e) => {
      const empActivities = activities.filter((a) => a.employee_name === e.name);
      return empActivities.length < 10;
    }).length;

    if (employeesWithLowActivity > employees.length * 0.2) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: "resource",
        title: "Optimize Monitoring Coverage",
        description: `${employeesWithLowActivity} employees have minimal monitored activity. Verify agent status.`,
        impact: "medium",
        effort: "low",
        priority: 70,
        actions: [
          "Verify agent installation on affected devices",
          "Check network connectivity issues",
          "Review employee work patterns",
          "Update monitoring policies if needed",
        ],
        metrics: { lowActivityCount: employeesWithLowActivity, totalEmployees: employees.length },
      });
    }

    // Sort by priority and limit
    const sortedRecommendations = recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);

    return new Response(
      JSON.stringify({
        recommendations: sortedRecommendations,
        metadata: {
          context,
          generatedAt: new Date().toISOString(),
          dataAnalyzed: {
            activities: activities.length,
            violations: violations.length,
            employees: employees.length,
          },
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
