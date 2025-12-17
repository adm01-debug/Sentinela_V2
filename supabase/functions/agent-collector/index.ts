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
    
    // Validate agent key from database
    if (!agentKey) {
      console.log("Missing agent key");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing agent key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the key exists and is active
    const { data: keyData, error: keyError } = await supabase
      .from("agent_keys")
      .select("id, is_active, employee_name, device_name")
      .eq("agent_key", agentKey)
      .maybeSingle();

    if (keyError || !keyData) {
      console.log("Invalid agent key:", agentKey.substring(0, 8) + "...");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid agent key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!keyData.is_active) {
      console.log("Inactive agent key:", keyData.id);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Agent key is inactive" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last_seen_at timestamp
    await supabase
      .from("agent_keys")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", keyData.id);

    const body = await req.json();
    const { type, data } = body;

    // Use employee_name and device_name from key if not provided in data
    const employeeName = data.employee_name || keyData.employee_name || "Unknown";
    const deviceName = data.device || keyData.device_name || "Unknown";

    console.log(`Received ${type} data from agent (key: ${keyData.id}):`, JSON.stringify(data).slice(0, 200));

    switch (type) {
      case "keystroke": {
        const { error } = await supabase.from("keystroke_logs").insert({
          employee_name: employeeName,
          device: deviceName,
          app_name: data.app_name,
          keystrokes_count: data.keystrokes_count,
          active_time_seconds: data.active_time_seconds,
          idle_time_seconds: data.idle_time_seconds,
          recorded_at: data.recorded_at || new Date().toISOString(),
        });
        if (error) throw error;
        break;
      }

      // NEW: Complete keystroke details (individual keys)
      case "keystroke_detail": {
        const { error } = await supabase.from("keystroke_details").insert({
          employee_name: employeeName,
          device: deviceName,
          app_name: data.app_name,
          window_title: data.window_title,
          key_pressed: data.key_pressed,
          key_code: data.key_code,
          modifiers: data.modifiers || [],
          is_sensitive: data.is_sensitive || false,
          recorded_at: data.recorded_at || new Date().toISOString(),
        });
        if (error) throw error;
        break;
      }

      // NEW: Batch keystroke details (array of keys)
      case "keystroke_details_batch": {
        const keys = data.keys || [];
        if (keys.length > 0) {
          const records = keys.map((k: any) => ({
            employee_name: employeeName,
            device: deviceName,
            app_name: k.app_name || data.app_name,
            window_title: k.window_title || data.window_title,
            key_pressed: k.key_pressed,
            key_code: k.key_code,
            modifiers: k.modifiers || [],
            is_sensitive: k.is_sensitive || false,
            recorded_at: k.recorded_at || new Date().toISOString(),
          }));
          const { error } = await supabase.from("keystroke_details").insert(records);
          if (error) throw error;
        }
        break;
      }

      // NEW: Click tracking
      case "click": {
        const { error } = await supabase.from("click_logs").insert({
          employee_name: employeeName,
          device: deviceName,
          app_name: data.app_name,
          window_title: data.window_title,
          click_type: data.click_type || 'left',
          x_position: data.x_position,
          y_position: data.y_position,
          target_element: data.target_element,
          url: data.url,
          recorded_at: data.recorded_at || new Date().toISOString(),
        });
        if (error) throw error;
        break;
      }

      // NEW: Batch click tracking
      case "clicks_batch": {
        const clicks = data.clicks || [];
        if (clicks.length > 0) {
          const records = clicks.map((c: any) => ({
            employee_name: employeeName,
            device: deviceName,
            app_name: c.app_name || data.app_name,
            window_title: c.window_title || data.window_title,
            click_type: c.click_type || 'left',
            x_position: c.x_position,
            y_position: c.y_position,
            target_element: c.target_element,
            url: c.url,
            recorded_at: c.recorded_at || new Date().toISOString(),
          }));
          const { error } = await supabase.from("click_logs").insert(records);
          if (error) throw error;
        }
        break;
      }

      case "productivity": {
        const { error } = await supabase.from("productivity_logs").insert({
          employee_name: employeeName,
          device: deviceName,
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
          employee_name: employeeName,
          device: deviceName,
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
          employee_name: employeeName,
          policy_name: data.policy_name,
          violation_type: data.violation_type,
          severity: data.severity || "medium",
          description: data.description,
          device: deviceName,
          ip_address: data.ip_address,
          screenshot_url: data.screenshot_url,
          location: data.location,
        });
        if (error) throw error;
        break;
      }

      case "heartbeat": {
        console.log(`Heartbeat from ${employeeName} on ${deviceName}`);
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
