import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUserOrServiceRole } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KeystrokeRow {
  app_name: string | null;
  active_time_seconds: number | null;
  idle_time_seconds: number | null;
  recorded_at: string | null;
  created_at: string | null;
}

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

    const { employeeName: employeeNameBody, employeeId, analysisPeriod = 30 } = await req.json();
    // `employeeId` segue aceito como alias: o bundle em cache envia o nome nesse campo.
    const employeeName: string | undefined = employeeNameBody ?? employeeId;
    const since = new Date(Date.now() - analysisPeriod * 24 * 60 * 60 * 1000).toISOString();

    // Fetch activities
    let query = supabase.from("keystroke_logs").select("*").gte("recorded_at", since);
    if (employeeName) query = query.eq("employee_name", employeeName);
    const { data: activitiesRaw } = await query.order("recorded_at", { ascending: true });
    const activities = (activitiesRaw ?? []) as KeystrokeRow[];

    const patterns: BehaviorPattern[] = [];

    if (!activities || activities.length === 0) {
      return new Response(
        JSON.stringify({ patterns: [], message: "No activities found for analysis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze work hour patterns
    const hourDistribution: Record<number, number> = {};
    activities.forEach((a) => {
      const ts = a.recorded_at ?? a.created_at;
      if (!ts) return;
      const hour = new Date(ts).getHours();
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
    });

    const workHours = Object.entries(hourDistribution).filter(
      ([_, count]) => count > activities.length * 0.01
    );
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
    activities.forEach((a) => {
      const app = a.app_name;
      if (app) {
        if (!appUsage[app]) appUsage[app] = { count: 0, totalTime: 0 };
        appUsage[app].count++;
        appUsage[app].totalTime += Number(a.active_time_seconds ?? 0);
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
    activities.forEach((a) => {
      const ts = a.recorded_at ?? a.created_at;
      if (!ts) return;
      const active = Number(a.active_time_seconds ?? 0);
      const idle = Number(a.idle_time_seconds ?? 0);
      if (active + idle > 0) {
        const day = ts.split("T")[0];
        if (!dailyProductivity[day]) dailyProductivity[day] = [];
        dailyProductivity[day].push((active / (active + idle)) * 100);
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
          recommendations:
            trend < 0
              ? [
                  "Review workload distribution",
                  "Check for blocking issues",
                  "Consider schedule optimization",
                ]
              : undefined,
        });
      }
    }

    // Detect unusual patterns (deviations)
    const dayOfWeekActivity: Record<number, number> = {};
    activities.forEach((a) => {
      const ts = a.created_at;
      if (!ts) return;
      const dow = new Date(ts).getDay();
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
          employeeName,
          analysisPeriod,
          activitiesAnalyzed: activities.length,
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
