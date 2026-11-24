import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUserOrServiceRole } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KeystrokeRow {
  employee_name: string;
  app_name: string | null;
  active_time_seconds: number | null;
  idle_time_seconds: number | null;
  recorded_at: string | null;
  created_at: string;
}

interface ActivitySummary {
  period: string;
  totalActivities: number;
  uniqueUsers: number;
  topApplications: { name: string; count: number; percentage: number }[];
  productivityScore: number;
  peakHours: { hour: number; count: number }[];
  violationsSummary: { total: number; bySeverity: Record<string, number> };
  highlights: string[];
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

    const { period = "day", employeeId } = await req.json();

    const periodHours = period === "day" ? 24 : period === "week" ? 168 : 720;
    const since = new Date(Date.now() - periodHours * 60 * 60 * 1000).toISOString();

    // Fetch activities
    let activityQuery = supabase.from("keystroke_logs").select("*").gte("recorded_at", since);
    if (employeeId) activityQuery = activityQuery.eq("employee_name", employeeId);
    const { data: activitiesRaw } = await activityQuery;
    const activities = (activitiesRaw ?? []) as KeystrokeRow[];

    // Fetch violations
    let violationQuery = supabase.from("security_violations").select("*").gte("created_at", since);
    const { data: violations } = await violationQuery;

    // Calculate metrics
    const totalActivities = activities?.length || 0;
    const uniqueUsers = new Set(activities?.map((a) => a.employee_name)).size;

    // Top applications
    const appCounts: Record<string, number> = {};
    activities?.forEach((a) => {
      const app = a.app_name;
      if (app) appCounts[app] = (appCounts[app] || 0) + 1;
    });
    const topApplications = Object.entries(appCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalActivities) * 100),
      }));

    // Productivity score (productive vs active time)
    const totalActive =
      activities?.reduce((s: number, a) => s + (a.active_time_seconds || 0), 0) || 0;
    const totalIdle = activities?.reduce((s: number, a) => s + (a.idle_time_seconds || 0), 0) || 0;
    const productivityScore =
      totalActive + totalIdle > 0 ? Math.round((totalActive / (totalActive + totalIdle)) * 100) : 0;

    // Peak hours
    const hourCounts: Record<number, number> = {};
    activities?.forEach((a) => {
      const hour = new Date(a.recorded_at ?? a.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Violations summary
    const violationsBySeverity: Record<string, number> = {};
    violations?.forEach((v: { severity: string }) => {
      violationsBySeverity[v.severity] = (violationsBySeverity[v.severity] || 0) + 1;
    });

    // Generate highlights
    const highlights: string[] = [];
    if (totalActivities > 0) {
      highlights.push(`${totalActivities} activities recorded from ${uniqueUsers} users`);
    }
    if (topApplications.length > 0) {
      highlights.push(
        `Most used app: ${topApplications[0].name} (${topApplications[0].percentage}%)`
      );
    }
    if (productivityScore > 0) {
      const status =
        productivityScore >= 70
          ? "good"
          : productivityScore >= 50
            ? "moderate"
            : "needs improvement";
      highlights.push(`Productivity is ${status} at ${productivityScore}%`);
    }
    if (violations?.length) {
      highlights.push(`${violations.length} violations detected this ${period}`);
    }

    const summary: ActivitySummary = {
      period,
      totalActivities,
      uniqueUsers,
      topApplications,
      productivityScore,
      peakHours,
      violationsSummary: {
        total: violations?.length || 0,
        bySeverity: violationsBySeverity,
      },
      highlights,
    };

    return new Response(
      JSON.stringify({
        summary,
        metadata: {
          period,
          startDate: since,
          endDate: new Date().toISOString(),
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
