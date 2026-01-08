import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { period = "day", employeeId, teamId } = await req.json();
    
    const periodHours = period === "day" ? 24 : period === "week" ? 168 : 720;
    const since = new Date(Date.now() - periodHours * 60 * 60 * 1000).toISOString();

    // Fetch activities
    let activityQuery = supabase.from("activities").select("*").gte("created_at", since);
    if (employeeId) activityQuery = activityQuery.eq("employee_id", employeeId);
    const { data: activities } = await activityQuery;

    // Fetch violations
    let violationQuery = supabase.from("violations").select("*").gte("created_at", since);
    const { data: violations } = await violationQuery;

    // Calculate metrics
    const totalActivities = activities?.length || 0;
    const uniqueUsers = new Set(activities?.map((a: any) => a.employee_id)).size;

    // Top applications
    const appCounts: Record<string, number> = {};
    activities?.forEach((a: any) => {
      if (a.application) appCounts[a.application] = (appCounts[a.application] || 0) + 1;
    });
    const topApplications = Object.entries(appCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalActivities) * 100),
      }));

    // Productivity score
    const productivityScores = activities?.filter((a: any) => a.productivity_score).map((a: any) => a.productivity_score) || [];
    const productivityScore = productivityScores.length > 0 
      ? Math.round(productivityScores.reduce((a: number, b: number) => a + b, 0) / productivityScores.length)
      : 0;

    // Peak hours
    const hourCounts: Record<number, number> = {};
    activities?.forEach((a: any) => {
      const hour = new Date(a.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Violations summary
    const violationsBySeverity: Record<string, number> = {};
    violations?.forEach((v: any) => {
      violationsBySeverity[v.severity] = (violationsBySeverity[v.severity] || 0) + 1;
    });

    // Generate highlights
    const highlights: string[] = [];
    if (totalActivities > 0) {
      highlights.push(`${totalActivities} activities recorded from ${uniqueUsers} users`);
    }
    if (topApplications.length > 0) {
      highlights.push(`Most used app: ${topApplications[0].name} (${topApplications[0].percentage}%)`);
    }
    if (productivityScore > 0) {
      const status = productivityScore >= 70 ? "good" : productivityScore >= 50 ? "moderate" : "needs improvement";
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
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
