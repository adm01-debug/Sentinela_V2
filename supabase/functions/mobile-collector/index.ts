import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeviceRegistration {
  employee_name: string;
  device_id: string;
  device_model?: string;
  os_type: "android" | "ios";
  os_version?: string;
  app_version?: string;
  push_token?: string;
}

interface ActivityData {
  device_id: string;
  employee_name: string;
  activity_type: "app_usage" | "location" | "screen_time";
  app_name?: string;
  duration_seconds?: number;
  latitude?: number;
  longitude?: number;
  metadata?: Record<string, any>;
  recorded_at?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "POST") {
      const body = await req.json();

      switch (action) {
        case "register": {
          const registration = body as DeviceRegistration;
          
          // Check if device already exists
          const { data: existingDevice } = await supabase
            .from("mobile_devices")
            .select("id")
            .eq("device_id", registration.device_id)
            .maybeSingle();

          if (existingDevice) {
            // Update existing device
            const { data, error } = await supabase
              .from("mobile_devices")
              .update({
                employee_name: registration.employee_name,
                device_model: registration.device_model,
                os_type: registration.os_type,
                os_version: registration.os_version,
                app_version: registration.app_version,
                push_token: registration.push_token,
                last_seen_at: new Date().toISOString(),
                is_active: true,
              })
              .eq("id", existingDevice.id)
              .select()
              .single();

            if (error) throw error;
            
            console.log("Device updated:", registration.device_id);
            return new Response(
              JSON.stringify({ success: true, device: data, action: "updated" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Create new device
          const { data, error } = await supabase
            .from("mobile_devices")
            .insert({
              employee_name: registration.employee_name,
              device_id: registration.device_id,
              device_model: registration.device_model,
              os_type: registration.os_type,
              os_version: registration.os_version,
              app_version: registration.app_version,
              push_token: registration.push_token,
              last_seen_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;

          console.log("Device registered:", registration.device_id);
          return new Response(
            JSON.stringify({ success: true, device: data, action: "created" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        case "activity": {
          const activities = Array.isArray(body) ? body : [body];
          
          // Get device UUID from device_id
          const deviceIds = [...new Set(activities.map((a: ActivityData) => a.device_id))];
          const { data: devices } = await supabase
            .from("mobile_devices")
            .select("id, device_id")
            .in("device_id", deviceIds);

          const deviceMap = new Map(devices?.map(d => [d.device_id, d.id]) || []);

          // Prepare activity logs
          const logs = activities.map((activity: ActivityData) => ({
            device_id: deviceMap.get(activity.device_id) || null,
            employee_name: activity.employee_name,
            activity_type: activity.activity_type,
            app_name: activity.app_name,
            duration_seconds: activity.duration_seconds,
            latitude: activity.latitude,
            longitude: activity.longitude,
            metadata: activity.metadata,
            recorded_at: activity.recorded_at || new Date().toISOString(),
          }));

          const { error } = await supabase
            .from("mobile_activity_logs")
            .insert(logs);

          if (error) throw error;

          // Update last_seen_at for devices
          for (const deviceId of deviceIds) {
            await supabase
              .from("mobile_devices")
              .update({ 
                last_seen_at: new Date().toISOString(),
                last_location_lat: activities.find((a: ActivityData) => a.device_id === deviceId && a.latitude)?.latitude,
                last_location_lng: activities.find((a: ActivityData) => a.device_id === deviceId && a.longitude)?.longitude,
              })
              .eq("device_id", deviceId);
          }

          console.log(`Logged ${logs.length} activities`);
          return new Response(
            JSON.stringify({ success: true, logged: logs.length }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        case "heartbeat": {
          const { device_id, latitude, longitude } = body;
          
          const { error } = await supabase
            .from("mobile_devices")
            .update({ 
              last_seen_at: new Date().toISOString(),
              last_location_lat: latitude,
              last_location_lng: longitude,
            })
            .eq("device_id", device_id);

          if (error) throw error;

          console.log("Heartbeat received:", device_id);
          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        default:
          return new Response(
            JSON.stringify({ error: "Unknown action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
      }
    }

    if (req.method === "GET") {
      const device_id = url.searchParams.get("device_id");
      
      if (action === "config" && device_id) {
        // Get monitoring policies for the device
        const { data: policies } = await supabase
          .from("security_policies")
          .select("*")
          .eq("enabled", true);

        // Get violation rules
        const { data: rules } = await supabase
          .from("violation_rules")
          .select("*")
          .eq("is_active", true);

        return new Response(
          JSON.stringify({ 
            success: true, 
            policies: policies || [],
            rules: rules || [],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Mobile collector error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
