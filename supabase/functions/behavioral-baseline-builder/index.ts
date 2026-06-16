import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASELINE_DAYS = 30;
const MIN_SAMPLES = 7;

interface FeatureValues {
  [day: string]: number;
}

function computeStats(values: number[]) {
  if (values.length === 0) return { mean: 0, std_dev: 0, min: 0, max: 0, p25: 0, p50: 0, p75: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const std_dev = Math.sqrt(variance);
  const pct = (p: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  return {
    mean,
    std_dev,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p25: pct(25),
    p50: pct(50),
    p75: pct(75),
  };
}

function dayKey(ts: string): string {
  return new Date(ts).toISOString().slice(0, 10);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const since = new Date(Date.now() - BASELINE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: employees, error: empErr } = await supabase
      .from("employees")
      .select("id, name, company_id, status")
      .eq("status", "active");

    if (empErr) throw empErr;

    let processed = 0;
    let skipped = 0;
    const startedAt = Date.now();

    for (const emp of employees || []) {
      const featureMap: Record<string, FeatureValues> = {
        daily_keystrokes: {},
        daily_clicks: {},
        daily_apps_used: {},
        weekend_activity_ratio: {},
        night_activity_ratio: {},
        screenshot_violations_per_day: {},
        clipboard_dlp_matches_per_day: {},
      };
      const workStartHours: number[] = [];
      const workEndHours: number[] = [];

      // Keystrokes
      const { data: keys } = await supabase
        .from("keystroke_logs")
        .select("keystrokes_count, recorded_at")
        .eq("employee_name", emp.name)
        .gte("recorded_at", since)
        .limit(10000);

      const appsByDay: Record<string, Set<string>> = {};
      for (const k of keys || []) {
        const day = dayKey(k.recorded_at);
        featureMap.daily_keystrokes[day] =
          (featureMap.daily_keystrokes[day] || 0) + (k.keystrokes_count || 0);
        const hour = new Date(k.recorded_at).getUTCHours();
        const dow = new Date(k.recorded_at).getUTCDay();
        if (hour < 6 || hour > 22) {
          featureMap.night_activity_ratio[day] = (featureMap.night_activity_ratio[day] || 0) + 1;
        }
        if (dow === 0 || dow === 6) {
          featureMap.weekend_activity_ratio[day] =
            (featureMap.weekend_activity_ratio[day] || 0) + 1;
        }
        workStartHours.push(hour);
      }

      // Clicks
      const { data: clicks } = await supabase
        .from("click_logs")
        .select("recorded_at, app_name")
        .eq("employee_name", emp.name)
        .gte("recorded_at", since)
        .limit(10000);

      for (const c of clicks || []) {
        const day = dayKey(c.recorded_at);
        featureMap.daily_clicks[day] = (featureMap.daily_clicks[day] || 0) + 1;
        if (c.app_name) {
          if (!appsByDay[day]) appsByDay[day] = new Set();
          appsByDay[day].add(c.app_name);
        }
        workEndHours.push(new Date(c.recorded_at).getUTCHours());
      }

      for (const [day, apps] of Object.entries(appsByDay)) {
        featureMap.daily_apps_used[day] = apps.size;
      }

      // DLP
      const { data: dlp } = await supabase
        .from("dlp_incidents")
        .select("detected_at")
        .eq("employee_name", emp.name)
        .gte("detected_at", since);

      for (const d of dlp || []) {
        const day = dayKey(d.detected_at);
        featureMap.clipboard_dlp_matches_per_day[day] =
          (featureMap.clipboard_dlp_matches_per_day[day] || 0) + 1;
      }

      // Compute & upsert
      const baselines = [];
      for (const [feature, dailyMap] of Object.entries(featureMap)) {
        const values = Object.values(dailyMap);
        const insufficient = values.length < MIN_SAMPLES;
        const stats = computeStats(values);
        baselines.push({
          employee_id: emp.id,
          company_id: emp.company_id,
          feature_name: feature,
          mean: stats.mean,
          std_dev: stats.std_dev,
          min_value: stats.min,
          max_value: stats.max,
          p25: stats.p25,
          p50: stats.p50,
          p75: stats.p75,
          sample_size: values.length,
          period_days: BASELINE_DAYS,
          insufficient_data: insufficient,
          computed_at: new Date().toISOString(),
        });
      }

      // Time features
      if (workStartHours.length >= MIN_SAMPLES) {
        const stats = computeStats(workStartHours);
        baselines.push({
          employee_id: emp.id,
          company_id: emp.company_id,
          feature_name: "work_hours_start",
          mean: stats.mean,
          std_dev: stats.std_dev,
          min_value: stats.min,
          max_value: stats.max,
          p25: stats.p25,
          p50: stats.p50,
          p75: stats.p75,
          sample_size: workStartHours.length,
          period_days: BASELINE_DAYS,
          insufficient_data: false,
          computed_at: new Date().toISOString(),
        });
      }

      if (workEndHours.length >= MIN_SAMPLES) {
        const stats = computeStats(workEndHours);
        baselines.push({
          employee_id: emp.id,
          company_id: emp.company_id,
          feature_name: "work_hours_end",
          mean: stats.mean,
          std_dev: stats.std_dev,
          min_value: stats.min,
          max_value: stats.max,
          p25: stats.p25,
          p50: stats.p50,
          p75: stats.p75,
          sample_size: workEndHours.length,
          period_days: BASELINE_DAYS,
          insufficient_data: false,
          computed_at: new Date().toISOString(),
        });
      }

      const hasData = baselines.some((b) => !b.insufficient_data);
      if (!hasData) {
        skipped++;
        continue;
      }

      const { error: upErr } = await supabase
        .from("behavioral_baselines")
        .upsert(baselines, { onConflict: "employee_id,feature_name" });

      if (upErr) console.error(`Upsert failed for ${emp.id}:`, upErr.message);
      else processed++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        skipped,
        total: employees?.length || 0,
        duration_ms: Date.now() - startedAt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("baseline-builder error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
