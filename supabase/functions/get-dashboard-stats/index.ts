import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const today = new Date().toISOString().split("T")[0];

    const [totalEmp, activeEmp, violations, alerts] = await Promise.all([
      supabase.from("employees").select("id", { count: "exact" }),
      supabase.from("employees").select("id", { count: "exact" }).eq("status", "active"),
      supabase
        .from("security_violations")
        .select("id", { count: "exact" })
        .gte("created_at", today),
      supabase.from("security_violations").select("id", { count: "exact" }).eq("status", "open"),
    ]);

    return new Response(
      JSON.stringify({
        totalEmployees: totalEmp.count ?? 0,
        activeEmployees: activeEmp.count ?? 0,
        todayViolations: violations.count ?? 0,
        openAlerts: alerts.count ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
