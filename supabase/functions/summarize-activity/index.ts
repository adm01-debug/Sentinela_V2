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
  hourlyDistribution: { hour: number; count: number }[];
  violationsSummary: { total: number; bySeverity: Record<string, number> };
  highlights: string[];
}

/** Hora local de Sao Paulo: a coluna e UTC e o gestor le o grafico no horario dele. */
const HOUR_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  hourCycle: "h23",
  timeZone: "America/Sao_Paulo",
});

function hourOf(iso: string | null): number | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const hour = Number(HOUR_FORMAT.format(date));
  return Number.isNaN(hour) ? null : hour;
}

const SP_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Sao_Paulo",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Deslocamento de Sao Paulo em minutos em relacao a UTC na data informada. */
function spOffsetMinutes(date: Date): number {
  const parts = SP_PARTS.formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? NaN);
  const wall = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((wall - Math.floor(date.getTime() / 60000) * 60000) / 60000);
}

/** yyyy-mm-dd lido como dia inteiro no horario do gestor (America/Sao_Paulo). */
function spDay(value: unknown, edge: "start" | "end"): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const midnightUtc = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(midnightUtc.getTime())) return null;
  const start = midnightUtc.getTime() - spOffsetMinutes(midnightUtc) * 60000;
  return new Date(edge === "start" ? start : start + 86_399_999).toISOString();
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

    const { period = "day", employeeId, startDate, endDate } = await req.json();

    const periodHours = period === "day" ? 24 : period === "week" ? 168 : 720;
    const since =
      spDay(startDate, "start") ??
      new Date(Date.now() - periodHours * 60 * 60 * 1000).toISOString();
    const until = spDay(endDate, "end") ?? new Date().toISOString();

    // Fetch activities
    let activityQuery = supabase
      .from("keystroke_logs")
      .select("*")
      .gte("recorded_at", since)
      .lte("recorded_at", until);
    if (employeeId) activityQuery = activityQuery.eq("employee_name", employeeId);
    const { data: activitiesRaw } = await activityQuery;
    const activities = (activitiesRaw ?? []) as KeystrokeRow[];

    // Fetch violations
    const violationQuery = supabase
      .from("security_violations")
      .select("*")
      .gte("created_at", since)
      .lte("created_at", until);
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
      const hour = hourOf(a.recorded_at ?? a.created_at);
      if (hour === null) return;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourCounts[hour] ?? 0,
    }));

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
      hourlyDistribution,
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
          endDate: until,
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
