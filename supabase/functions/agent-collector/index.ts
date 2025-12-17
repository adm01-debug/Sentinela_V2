import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-agent-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const agentKey = req.headers.get("x-agent-key");
    
    // Simple agent authentication (in production, use proper auth)
    if (!agentKey || agentKey.length < 10) {
      console.log("Invalid agent key");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { type, data } = body;

    console.log(`Received ${type} data from agent:`, JSON.stringify(data).slice(0, 200));

    switch (type) {
      case "keystroke": {
        const { error } = await supabase.from("keystroke_logs").insert({
          employee_name: data.employee_name,
          device: data.device,
          app_name: data.app_name,
          keystrokes_count: data.keystrokes_count,
          active_time_seconds: data.active_time_seconds,
          idle_time_seconds: data.idle_time_seconds,
          recorded_at: data.recorded_at || new Date().toISOString(),
        });
        if (error) throw error;
        break;
      }

      case "productivity": {
        const { error } = await supabase.from("productivity_logs").insert({
          employee_name: data.employee_name,
          device: data.device,
          productive_time_seconds: data.productive_time_seconds,
          unproductive_time_seconds: data.unproductive_time_seconds,
          neutral_time_seconds: data.neutral_time_seconds,
          apps_used: data.apps_used || [],
          recorded_date: data.recorded_date || new Date().toISOString().split('T')[0],
        });
        if (error) throw error;
        break;
      }

      case "screenshot": {
        const { error } = await supabase.from("screen_captures").insert({
          employee_name: data.employee_name,
          device: data.device,
          capture_url: data.capture_url,
          app_name: data.app_name,
          window_title: data.window_title,
          captured_at: data.captured_at || new Date().toISOString(),
        });
        if (error) throw error;
        break;
      }

      case "violation": {
        const { error } = await supabase.from("security_violations").insert({
          employee_name: data.employee_name,
          policy_name: data.policy_name,
          violation_type: data.violation_type,
          severity: data.severity || "medium",
          description: data.description,
          device: data.device,
          ip_address: data.ip_address,
        });
        if (error) throw error;
        break;
      }

      case "heartbeat": {
        console.log(`Heartbeat from ${data.employee_name} on ${data.device}`);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown data type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing agent data:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
