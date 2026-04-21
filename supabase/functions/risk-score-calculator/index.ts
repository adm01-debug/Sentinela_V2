import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { HalfSpaceTrees, normalize, zScore } from "../_shared/halfSpaceTrees.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HST_TREES = 50;
const HST_DEPTH = 8;
const ALERT_DELTA_SIGMA = 2;

interface Baseline {
  feature_name: string;
  mean: number;
  std_dev: number;
  insufficient_data: boolean;
}

interface RiskFactor {
  name: string;
  weight: number;
  enabled: boolean;
}

interface FactorContribution {
  name: string;
  z_score: number;
  weight: number;
  contribution: number;
  current: number;
  baseline_mean: number;
}

const FEATURE_TO_FACTOR: Record<string, string> = {
  daily_keystrokes: "volume_anomaly",
  daily_clicks: "volume_anomaly",
  daily_apps_used: "app_diversity",
  work_hours_start: "schedule_deviation",
  work_hours_end: "schedule_deviation",
  weekend_activity_ratio: "weekend_activity",
  night_activity_ratio: "off_hours_activity",
  clipboard_dlp_matches_per_day: "dlp_matches",
  screenshot_violations_per_day: "screenshot_violations",
};

const FACTOR_TO_MITRE: Record<string, string[]> = {
  dlp_matches: ["T1567", "T1530"],
  off_hours_activity: ["T1078"],
  weekend_activity: ["T1078"],
  screenshot_violations: ["T1119"],
  volume_anomaly: ["T1071"],
};

function levelFromScore(score: number): string {
  if (score >= 76) return "critical";
  if (score >= 51) return "high";
  if (score >= 26) return "medium";
  return "low";
}

async function computeCurrentMetrics(
  supabase: ReturnType<typeof createClient>,
  employeeName: string,
  hours: number
): Promise<Record<string, number>> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const metrics: Record<string, number> = {
    daily_keystrokes: 0,
    daily_clicks: 0,
    daily_apps_used: 0,
    weekend_activity_ratio: 0,
    night_activity_ratio: 0,
    clipboard_dlp_matches_per_day: 0,
    screenshot_violations_per_day: 0,
  };

  const { data: keys } = await supabase
    .from("keystroke_logs")
    .select("keystrokes_count, recorded_at")
    .eq("employee_name", employeeName)
    .gte("recorded_at", since)
    .limit(5000);

  let nightCount = 0;
  let weekendCount = 0;
  const startHours: number[] = [];
  for (const k of (keys as Array<{ keystrokes_count: number; recorded_at: string }> | null) || []) {
    metrics.daily_keystrokes += k.keystrokes_count || 0;
    const d = new Date(k.recorded_at);
    const h = d.getUTCHours();
    const dow = d.getUTCDay();
    if (h < 6 || h > 22) nightCount++;
    if (dow === 0 || dow === 6) weekendCount++;
    startHours.push(h);
  }

  const { data: clicks } = await supabase
    .from("click_logs")
    .select("recorded_at, app_name")
    .eq("employee_name", employeeName)
    .gte("recorded_at", since)
    .limit(5000);

  const apps = new Set<string>();
  for (const c of (clicks as Array<{ recorded_at: string; app_name: string | null }> | null) || []) {
    metrics.daily_clicks++;
    if (c.app_name) apps.add(c.app_name);
  }
  metrics.daily_apps_used = apps.size;
  metrics.night_activity_ratio = nightCount;
  metrics.weekend_activity_ratio = weekendCount;

  const { data: dlp } = await supabase
    .from("dlp_incidents")
    .select("id")
    .eq("employee_name", employeeName)
    .gte("detected_at", since);
  metrics.clipboard_dlp_matches_per_day = ((dlp as unknown[]) || []).length;

  return metrics;
}

async function processEmployee(
  supabase: ReturnType<typeof createClient>,
  employee: { id: string; name: string; company_id: string | null },
  factors: RiskFactor[],
  period: string,
  shadowMode: boolean
): Promise<{ score: number; level: string; alerted: boolean } | null> {
  const hours = period === "7d" ? 168 : 24;

  const { data: baselineRows } = await supabase
    .from("behavioral_baselines")
    .select("feature_name, mean, std_dev, insufficient_data")
    .eq("employee_id", employee.id);

  const baselines: Baseline[] = (baselineRows as Baseline[]) || [];
  if (baselines.length === 0 || baselines.every((b) => b.insufficient_data)) return null;

  const current = await computeCurrentMetrics(supabase, employee.name, hours);

  const featureNames = baselines.map((b) => b.feature_name);
  const trainVectors: number[][] = [];
  // Synthetic training points around baseline mean ± std_dev (since real history sampling here is too costly)
  for (let i = 0; i < 100; i++) {
    const v = baselines.map((b) => normalize(b.mean + (Math.random() - 0.5) * b.std_dev * 2, b.mean, b.std_dev || 1));
    trainVectors.push(v);
  }

  const hst = new HalfSpaceTrees(featureNames.length, { numTrees: HST_TREES, maxDepth: HST_DEPTH });
  hst.fit(trainVectors);

  const currentVec = baselines.map((b) => normalize(current[b.feature_name] ?? 0, b.mean, b.std_dev || 1));
  const hstScore = hst.score(currentVec);

  const factorMap = new Map(factors.map((f) => [f.name, f]));
  const contributions: FactorContribution[] = [];
  let maxAbsZ = 0;
  const detectedMitre = new Set<string>();

  for (const b of baselines) {
    if (b.insufficient_data) continue;
    const cur = current[b.feature_name] ?? 0;
    const z = zScore(cur, b.mean, b.std_dev || 1);
    if (Math.abs(z) > maxAbsZ) maxAbsZ = Math.abs(z);

    const factorName = FEATURE_TO_FACTOR[b.feature_name];
    const factor = factorName ? factorMap.get(factorName) : undefined;
    if (factor && factor.enabled && Math.abs(z) > 1.5) {
      const contribution = Math.min(100, Math.abs(z) * factor.weight * 10);
      contributions.push({
        name: factor.name,
        z_score: Number(z.toFixed(2)),
        weight: factor.weight,
        contribution: Number(contribution.toFixed(2)),
        current: cur,
        baseline_mean: Number(b.mean.toFixed(2)),
      });
      const mitre = FACTOR_TO_MITRE[factor.name] || [];
      for (const t of mitre) detectedMitre.add(t);
    }
  }

  const zNorm = Math.min(1, maxAbsZ / 4);
  const finalScore = Math.round((0.6 * hstScore + 0.4 * zNorm) * 100);
  const level = levelFromScore(finalScore);

  // Check delta vs previous score
  const { data: prev } = await supabase
    .from("user_risk_scores")
    .select("score")
    .eq("employee_id", employee.id)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const prevScore = (prev as { score: number } | null)?.score ?? 0;
  const delta = Math.abs(finalScore - prevScore);
  const shouldAlert = !shadowMode && delta > ALERT_DELTA_SIGMA * 10 && finalScore >= 51;

  await supabase.from("user_risk_scores").insert({
    employee_id: employee.id,
    company_id: employee.company_id,
    score: finalScore,
    level,
    hst_score: Number(hstScore.toFixed(4)),
    z_score_max: Number(maxAbsZ.toFixed(2)),
    factors: contributions,
    mitre_techniques: Array.from(detectedMitre),
    period,
    shadow_mode: shadowMode,
    alert_triggered: shouldAlert,
    calculated_at: new Date().toISOString(),
  });

  if (shouldAlert) {
    try {
      await supabase.functions.invoke("process-violation-alert", {
        body: {
          type: "ueba_anomaly",
          severity: level === "critical" ? "critical" : "high",
          employee_name: employee.name,
          employee_id: employee.id,
          description: `Risk score elevated to ${finalScore} (${level}). Δ=${delta} from previous.`,
          metadata: { factors: contributions, mitre_techniques: Array.from(detectedMitre) },
        },
      });
    } catch (e) {
      console.error("alert dispatch failed:", e instanceof Error ? e.message : e);
    }
  }

  return { score: finalScore, level, alerted: shouldAlert };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const { employeeId, period = "24h", shadowMode = false } = body;

    const { data: factors } = await supabase
      .from("risk_score_factors")
      .select("name, weight, enabled");

    const factorList = (factors as RiskFactor[]) || [];

    let employees: Array<{ id: string; name: string; company_id: string | null }>;
    if (employeeId) {
      const { data } = await supabase
        .from("employees")
        .select("id, name, company_id")
        .eq("id", employeeId)
        .maybeSingle();
      if (!data) {
        return new Response(JSON.stringify({ error: "Employee not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      employees = [data as { id: string; name: string; company_id: string | null }];
    } else {
      const { data } = await supabase
        .from("employees")
        .select("id, name, company_id")
        .eq("status", "active")
        .limit(100);
      employees = (data as Array<{ id: string; name: string; company_id: string | null }>) || [];
    }

    const results = [];
    let alertsTriggered = 0;
    const startedAt = Date.now();

    for (const emp of employees) {
      const r = await processEmployee(supabase, emp, factorList, period, shadowMode);
      if (r) {
        results.push({ employee_id: emp.id, ...r });
        if (r.alerted) alertsTriggered++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        skipped: employees.length - results.length,
        alerts_triggered: alertsTriggered,
        shadow_mode: shadowMode,
        duration_ms: Date.now() - startedAt,
        results: employeeId ? results : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("risk-score-calculator error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
