import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnomalyPrediction {
  id: string;
  type: string;
  probability: number;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedEntities: string[];
  suggestedActions: string[];
  timestamp: string;
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

    const { entityType, entityId, timeRange = "24h", threshold = 0.7 } = await req.json();

    // Fetch recent activity data
    const hoursAgo = timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    // Analyze patterns and detect anomalies
    const predictions: AnomalyPrediction[] = [];
    
    // Group activities by hour
    const hourlyGroups: Record<number, number> = {};
    activities?.forEach((a: any) => {
      const hour = new Date(a.created_at).getHours();
      hourlyGroups[hour] = (hourlyGroups[hour] || 0) + 1;
    });

    // Calculate statistics
    const values = Object.values(hourlyGroups);
    const mean = values.reduce((a, b) => a + b, 0) / values.length || 0;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length) || 1;

    // Detect anomalies using Z-score
    Object.entries(hourlyGroups).forEach(([hour, count]) => {
      const zScore = Math.abs((count - mean) / stdDev);
      if (zScore > 2) {
        const probability = Math.min(0.99, 0.5 + zScore * 0.1);
        if (probability >= threshold) {
          predictions.push({
            id: crypto.randomUUID(),
            type: count > mean ? "unusual_high_activity" : "unusual_low_activity",
            probability,
            severity: zScore > 3 ? "high" : zScore > 2.5 ? "medium" : "low",
            description: `Unusual activity level detected at hour ${hour}: ${count} activities (expected ~${Math.round(mean)})`,
            affectedEntities: [],
            suggestedActions: [
              "Review activity logs for this time period",
              "Check if scheduled tasks were running",
              "Verify user behavior patterns"
            ],
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Check for behavioral anomalies
    const userGroups: Record<string, number> = {};
    activities?.forEach((a: any) => {
      if (a.user_id) userGroups[a.user_id] = (userGroups[a.user_id] || 0) + 1;
    });

    const userValues = Object.values(userGroups);
    const userMean = userValues.reduce((a, b) => a + b, 0) / userValues.length || 0;
    const userStdDev = Math.sqrt(userValues.reduce((sum, v) => sum + Math.pow(v - userMean, 2), 0) / userValues.length) || 1;

    Object.entries(userGroups).forEach(([userId, count]) => {
      const zScore = (count - userMean) / userStdDev;
      if (zScore > 2.5) {
        predictions.push({
          id: crypto.randomUUID(),
          type: "abnormal_user_activity",
          probability: Math.min(0.99, 0.6 + zScore * 0.08),
          severity: zScore > 4 ? "critical" : zScore > 3 ? "high" : "medium",
          description: `User ${userId} has unusually high activity: ${count} actions (expected ~${Math.round(userMean)})`,
          affectedEntities: [userId],
          suggestedActions: [
            "Review user's recent activities",
            "Check for automated or scripted behavior",
            "Verify account security"
          ],
          timestamp: new Date().toISOString()
        });
      }
    });

    return new Response(
      JSON.stringify({
        predictions,
        metadata: {
          analyzedRecords: activities?.length || 0,
          timeRange,
          threshold,
          generatedAt: new Date().toISOString()
        }
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
