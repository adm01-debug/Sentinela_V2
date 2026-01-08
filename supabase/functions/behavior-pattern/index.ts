import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BehaviorPattern {
  id: string;
  type: "routine" | "deviation" | "trend" | "anomaly";
  description: string;
  confidence: number;
  frequency: "daily" | "weekly" | "occasional";
  affectedMetrics: string[];
  recommendations?: string[];
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

    const { employeeId, analysisPeriod = 30 } = await req.json();
    const since = new Date(Date.now() - analysisPeriod * 24 * 60 * 60 * 1000).toISOString();

    // Fetch activities
    let query = supabase.from("activities").select("*").gte("created_at", since);
    if (employeeId) query = query.eq("employee_id", employeeId);
    const { data: activities } = await query.order("created_at", { ascending: true });

    const patterns: BehaviorPattern[] = [];

    if (!activities || activities.length === 0) {
      return new Response(
        JSON.stringify({ patterns: [], message: "No activities found for analysis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze work hour patterns
    const hourDistribution: Record<number, number> = {};
    activities.forEach((a: any) => {
      const hour = new Date(a.created_at).getHours();
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
    });

    const workHours = Object.entries(hourDistribution).filter(([_, count]) => count > activities.length * 0.01);
    const startHour = Math.min(...workHours.map(([h]) => parseInt(h)));
    const endHour = Math.max(...workHours.map(([h]) => parseInt(h)));

    patterns.push({
      id: crypto.randomUUID(),
      type: "routine",
      description: `Typical work hours: ${startHour}:00 to ${endHour}:00`,
      confidence: 0.85,
      frequency: "daily",
      affectedMetrics: ["work_hours", "availability"],
    });

    // Analyze application usage patterns
    const appUsage: Record<string, { count: number; totalTime: number }> = {};
    activities.forEach((a: any) => {
      if (a.application) {
        if (!appUsage[a.application]) appUsage[a.application] = { count: 0, totalTime: 0 };
        appUsage[a.application].count++;
        appUsage[a.application].totalTime += a.duration || 0;
      }
    });

    const topApps = Object.entries(appUsage)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);

    if (topApps.length > 0) {
      patterns.push({
        id: crypto.randomUUID(),
        type: "routine",
        description: `Primary tools: ${topApps.map(([app]) => app).join(", ")}`,
        confidence: 0.9,
        frequency: "daily",
        affectedMetrics: ["application_usage", "productivity"],
      });
    }

    // Detect productivity trends
    const dailyProductivity: Record<string, number[]> = {};
    activities.forEach((a: any) => {
      if (a.productivity_score) {
        const day = a.created_at.split("T")[0];
        if (!dailyProductivity[day]) dailyProductivity[day] = [];
        dailyProductivity[day].push(a.productivity_score);
      }
    });

    const dailyAverages = Object.entries(dailyProductivity)
      .map(([day, scores]) => ({
        day,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => a.day.localeCompare(b.day));

    if (dailyAverages.length >= 7) {
      const firstWeek = dailyAverages.slice(0, 7).reduce((s, d) => s + d.avg, 0) / 7;
      const lastWeek = dailyAverages.slice(-7).reduce((s, d) => s + d.avg, 0) / 7;
      const trend = lastWeek - firstWeek;

      if (Math.abs(trend) > 5) {
        patterns.push({
          id: crypto.randomUUID(),
          type: "trend",
          description: `Productivity ${trend > 0 ? "increasing" : "decreasing"} by ${Math.abs(trend).toFixed(1)}% over the period`,
          confidence: 0.75,
          frequency: "weekly",
          affectedMetrics: ["productivity"],
          recommendations: trend < 0 ? [
            "Review workload distribution",
            "Check for blocking issues",
            "Consider schedule optimization",
          ] : undefined,
        });
      }
    }

    // Detect unusual patterns (deviations)
    const dayOfWeekActivity: Record<number, number> = {};
    activities.forEach((a: any) => {
      const dow = new Date(a.created_at).getDay();
      dayOfWeekActivity[dow] = (dayOfWeekActivity[dow] || 0) + 1;
    });

    const weekdayAvg = [1, 2, 3, 4, 5].reduce((s, d) => s + (dayOfWeekActivity[d] || 0), 0) / 5;
    const weekendAvg = [0, 6].reduce((s, d) => s + (dayOfWeekActivity[d] || 0), 0) / 2;

    if (weekendAvg > weekdayAvg * 0.3) {
      patterns.push({
        id: crypto.randomUUID(),
        type: "deviation",
        description: "Significant weekend activity detected",
        confidence: 0.8,
        frequency: "weekly",
        affectedMetrics: ["work_life_balance", "overtime"],
        recommendations: [
          "Review weekend work necessity",
          "Monitor for burnout signs",
          "Consider workload redistribution",
        ],
      });
    }

    return new Response(
      JSON.stringify({
        patterns,
        metadata: {
          employeeId,
          analysisPeriod,
          activitiesAnalyzed: activities.length,
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
