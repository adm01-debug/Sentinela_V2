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

    // Get all teams
    const { data: teams, error: teamErr } = await supabase.from("teams").select("id");
    if (teamErr) throw teamErr;

    const results: Array<{ teamId: string; memberCount: number }> = [];

    for (const team of teams ?? []) {
      // Count employees assigned to this team
      const { count: empCount } = await supabase
        .from("employees")
        .select("id", { count: "exact" })
        .eq("team_id", team.id);

      // Count team_members entries
      const { count: memberCount } = await supabase
        .from("team_members")
        .select("id", { count: "exact" })
        .eq("team_id", team.id);

      const total = Math.max(empCount ?? 0, memberCount ?? 0);
      results.push({ teamId: team.id, memberCount: total });
    }

    return new Response(JSON.stringify({ synced: results.length, teams: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
