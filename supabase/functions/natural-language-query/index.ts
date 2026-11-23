import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  score: number;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json().catch(() => ({}));
    const { query, tables = ["employees", "activities", "violations"], maxResults = 20 } = body;

    // Validate query is a non-empty string
    if (typeof query !== "string" || !query.trim()) {
      return new Response(
        JSON.stringify({ error: "Field 'query' is required and must be a non-empty string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    // Extract keywords
    const keywords = queryLower
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(
        (w: string) =>
          w.length > 2 &&
          !["the", "and", "for", "with", "from", "show", "find", "get", "all"].includes(w)
      );

    // If no meaningful keywords, return empty results
    if (keywords.length === 0) {
      return new Response(
        JSON.stringify({
          results: [],
          query,
          keywords: [],
          totalResults: 0,
          generatedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Search employees
    if (tables.includes("employees")) {
      const { data: employees } = await supabase
        .from("employees")
        .select("id, name, email, department, position, status")
        .or(
          keywords
            .map((k: string) => `name.ilike.%${k}%,email.ilike.%${k}%,department.ilike.%${k}%`)
            .join(",")
        )
        .limit(maxResults);

      employees?.forEach((emp: any) => {
        const score = keywords.reduce((s: number, k: string) => {
          if (emp.name?.toLowerCase().includes(k)) s += 0.4;
          if (emp.email?.toLowerCase().includes(k)) s += 0.3;
          if (emp.department?.toLowerCase().includes(k)) s += 0.2;
          return s;
        }, 0.1);

        results.push({
          id: emp.id,
          type: "employee",
          title: emp.name,
          description: `${emp.position || "Employee"} - ${emp.department || "N/A"} (${emp.status})`,
          score: Math.min(score, 1),
          metadata: emp,
        });
      });
    }

    // Search violations
    if (tables.includes("violations")) {
      const { data: violations } = await supabase
        .from("security_violations")
        .select("id, violation_type, policy_name, severity, description, employee_name, created_at")
        .or(
          keywords
            .map(
              (k: string) =>
                `violation_type.ilike.%${k}%,policy_name.ilike.%${k}%,description.ilike.%${k}%,severity.ilike.%${k}%`
            )
            .join(",")
        )
        .limit(maxResults);

      violations?.forEach((vio: any) => {
        const score = keywords.reduce((s: number, k: string) => {
          if (vio.violation_type?.toLowerCase().includes(k)) s += 0.4;
          if (vio.policy_name?.toLowerCase().includes(k)) s += 0.3;
          if (vio.description?.toLowerCase().includes(k)) s += 0.3;
          if (vio.severity?.toLowerCase().includes(k)) s += 0.2;
          return s;
        }, 0.1);

        results.push({
          id: vio.id,
          type: "violation",
          title: vio.violation_type,
          description: `${vio.severity} - ${vio.description?.substring(0, 100)}`,
          score: Math.min(score, 1),
          metadata: vio,
        });
      });
    }

    // Search activities
    if (tables.includes("activities")) {
      const { data: activities } = await supabase
        .from("keystroke_logs")
        .select("id, app_name, employee_name, recorded_at")
        .or(
          keywords
            .map(
              (k: string) => `app_name.ilike.%${k}%,employee_name.ilike.%${k}%,device.ilike.%${k}%`
            )
            .join(",")
        )
        .limit(maxResults);

      activities?.forEach((act: any) => {
        const score = keywords.reduce((s: number, k: string) => {
          if (act.app_name?.toLowerCase().includes(k)) s += 0.3;
          if (act.employee_name?.toLowerCase().includes(k)) s += 0.4;
          return s;
        }, 0.1);

        results.push({
          id: act.id,
          type: "activity",
          title: `${act.employee_name} - ${act.app_name ?? "Sem aplicativo"}`,
          description: `Activity: ${act.app_name ?? "N/A"}`,
          score: Math.min(score, 1),
          metadata: act,
        });
      });
    }

    const sortedResults = results.sort((a, b) => b.score - a.score).slice(0, maxResults);

    return new Response(
      JSON.stringify({
        results: sortedResults,
        query,
        keywords,
        totalResults: sortedResults.length,
        generatedAt: new Date().toISOString(),
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
