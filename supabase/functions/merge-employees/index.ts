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
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin)
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const { keepId, mergeId } = await req.json();
    if (!keepId || !mergeId)
      return new Response(JSON.stringify({ error: "keepId and mergeId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // Get merged employee name for name-based tables
    const { data: mergedEmp } = await supabase
      .from("employees")
      .select("name")
      .eq("id", mergeId)
      .single();
    const { data: keepEmp } = await supabase
      .from("employees")
      .select("name")
      .eq("id", keepId)
      .single();

    if (!mergedEmp || !keepEmp) {
      return new Response(JSON.stringify({ error: "Employee not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update ID-based references
    const idUpdates = await Promise.allSettled([
      supabase.from("employee_devices").update({ employee_id: keepId }).eq("employee_id", mergeId),
      supabase.from("employee_badges").update({ employee_id: keepId }).eq("employee_id", mergeId),
      supabase
        .from("employee_geofences")
        .update({ employee_id: keepId })
        .eq("employee_id", mergeId),
      supabase
        .from("employee_schedules")
        .update({ employee_id: keepId })
        .eq("employee_id", mergeId),
      supabase.from("devices").update({ employee_id: keepId }).eq("employee_id", mergeId),
    ]);

    // Update name-based references
    const nameUpdates = await Promise.allSettled([
      supabase
        .from("keystroke_logs")
        .update({ employee_name: keepEmp.name })
        .eq("employee_name", mergedEmp.name),
      supabase
        .from("click_logs")
        .update({ employee_name: keepEmp.name })
        .eq("employee_name", mergedEmp.name),
      supabase
        .from("geofence_violations")
        .update({ employee_name: keepEmp.name })
        .eq("employee_name", mergedEmp.name),
    ]);

    // Delete merged employee
    await supabase.from("employees").delete().eq("id", mergeId);

    const totalOps = idUpdates.length + nameUpdates.length;
    const failures = [...idUpdates, ...nameUpdates].filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({ success: true, keepId, mergeId, operationsRun: totalOps, failures }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
