import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrendForecast {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: "increasing" | "decreasing" | "stable";
  confidence: number;
  timeframe: string;
  dataPoints: { date: string; value: number }[];
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

    const { metrics = ["activity", "violations", "productivity"], forecastDays = 7 } = await req.json();
    const forecasts: TrendForecast[] = [];

    // Get historical data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    if (metrics.includes("activity")) {
      const { data: activities } = await supabase
        .from("activities")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo);

      // Group by day
      const dailyCounts: Record<string, number> = {};
      activities?.forEach((a: any) => {
        const date = a.created_at.split("T")[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      const dataPoints = Object.entries(dailyCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, value]) => ({ date, value }));

      if (dataPoints.length >= 7) {
        // Simple linear regression for forecasting
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((s, _, i) => s + i, 0);
        const sumY = dataPoints.reduce((s, p) => s + p.value, 0);
        const sumXY = dataPoints.reduce((s, p, i) => s + i * p.value, 0);
        const sumX2 = dataPoints.reduce((s, _, i) => s + i * i, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const currentValue = dataPoints[dataPoints.length - 1].value;
        const predictedValue = Math.max(0, Math.round(intercept + slope * (n + forecastDays)));

        forecasts.push({
          metric: "activity_count",
          currentValue,
          predictedValue,
          trend: slope > 1 ? "increasing" : slope < -1 ? "decreasing" : "stable",
          confidence: Math.min(0.9, 0.5 + (n / 60)),
          timeframe: `${forecastDays} days`,
          dataPoints: dataPoints.slice(-14)
        });
      }
    }

    if (metrics.includes("violations")) {
      const { data: violations } = await supabase
        .from("violations")
        .select("created_at, severity")
        .gte("created_at", thirtyDaysAgo);

      const dailyCounts: Record<string, number> = {};
      violations?.forEach((v: any) => {
        const date = v.created_at.split("T")[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      const dataPoints = Object.entries(dailyCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, value]) => ({ date, value }));

      if (dataPoints.length >= 7) {
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((s, _, i) => s + i, 0);
        const sumY = dataPoints.reduce((s, p) => s + p.value, 0);
        const sumXY = dataPoints.reduce((s, p, i) => s + i * p.value, 0);
        const sumX2 = dataPoints.reduce((s, _, i) => s + i * i, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const currentValue = dataPoints[dataPoints.length - 1].value;
        const predictedValue = Math.max(0, Math.round(intercept + slope * (n + forecastDays)));

        forecasts.push({
          metric: "violation_count",
          currentValue,
          predictedValue,
          trend: slope > 0.5 ? "increasing" : slope < -0.5 ? "decreasing" : "stable",
          confidence: Math.min(0.85, 0.4 + (n / 60)),
          timeframe: `${forecastDays} days`,
          dataPoints: dataPoints.slice(-14)
        });
      }
    }

    if (metrics.includes("productivity")) {
      const { data: activities } = await supabase
        .from("activities")
        .select("created_at, productivity_score")
        .gte("created_at", thirtyDaysAgo)
        .not("productivity_score", "is", null);

      const dailyScores: Record<string, { sum: number; count: number }> = {};
      activities?.forEach((a: any) => {
        const date = a.created_at.split("T")[0];
        if (!dailyScores[date]) dailyScores[date] = { sum: 0, count: 0 };
        dailyScores[date].sum += a.productivity_score;
        dailyScores[date].count++;
      });

      const dataPoints = Object.entries(dailyScores)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, { sum, count }]) => ({ date, value: Math.round(sum / count) }));

      if (dataPoints.length >= 7) {
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((s, _, i) => s + i, 0);
        const sumY = dataPoints.reduce((s, p) => s + p.value, 0);
        const sumXY = dataPoints.reduce((s, p, i) => s + i * p.value, 0);
        const sumX2 = dataPoints.reduce((s, _, i) => s + i * i, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const currentValue = dataPoints[dataPoints.length - 1].value;
        const predictedValue = Math.min(100, Math.max(0, Math.round(intercept + slope * (n + forecastDays))));

        forecasts.push({
          metric: "productivity_score",
          currentValue,
          predictedValue,
          trend: slope > 0.5 ? "increasing" : slope < -0.5 ? "decreasing" : "stable",
          confidence: Math.min(0.8, 0.45 + (n / 60)),
          timeframe: `${forecastDays} days`,
          dataPoints: dataPoints.slice(-14)
        });
      }
    }

    return new Response(
      JSON.stringify({
        forecasts,
        metadata: {
          forecastDays,
          generatedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
