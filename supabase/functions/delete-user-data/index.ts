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

    // Verify caller is admin
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

    const { employeeId } = await req.json();
    if (!employeeId)
      return new Response(JSON.stringify({ error: "employeeId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // Delete from all related tables (LGPD compliance - right to be forgotten)
    const deletions = await Promise.allSettled([
      supabase.from("keystroke_logs").delete().eq("employee_name", employeeId),
      supabase.from("keystroke_details").delete().eq("employee_name", employeeId),
      supabase.from("click_logs").delete().eq("employee_name", employeeId),
      supabase.from("screen_captures").delete().eq("employee_id", employeeId),
      supabase.from("session_recordings").delete().eq("employee_id", employeeId),
      supabase.from("security_violations").delete().eq("employee_id", employeeId),
      supabase.from("mobile_activity_logs").delete().eq("employee_name", employeeId),
      supabase.from("employee_badges").delete().eq("employee_id", employeeId),
      supabase.from("employee_points").delete().eq("employee_id", employeeId),
      supabase.from("employee_geofences").delete().eq("employee_id", employeeId),
      supabase.from("employee_schedules").delete().eq("employee_id", employeeId),
      supabase.from("employee_devices").delete().eq("employee_id", employeeId),
      supabase.from("internet_access_settings").delete().eq("employee_name", employeeId),
      supabase.from("geofence_violations").delete().eq("employee_name", employeeId),
      supabase.from("employees").delete().eq("id", employeeId),
    ]);

    const failed = deletions.filter((d) => d.status === "rejected").length;

    return new Response(
      JSON.stringify({
        success: true,
        employeeId,
        tablesProcessed: deletions.length,
        failures: failed,
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
