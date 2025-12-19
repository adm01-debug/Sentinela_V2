import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 120; // Max geofence checks per window
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute window

interface GeofenceCheckRequest {
  employee_name: string;
  device?: string;
  latitude: number;
  longitude: number;
}

interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function checkRateLimit(
  supabase: any,
  identifier: string,
  identifierType: string,
  endpoint: string
): Promise<{ allowed: boolean; retryAfter?: number; remaining?: number }> {
  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_endpoint: endpoint,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      return { allowed: true };
    }

    return {
      allowed: data.allowed,
      retryAfter: data.retry_after_seconds,
      remaining: data.remaining,
    };
  } catch (e) {
    console.error("Rate limit exception:", e);
    return { allowed: true };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get client IP for rate limiting
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("x-real-ip") || 
                   "unknown";

  try {
    // Rate limit by IP
    const rateCheck = await checkRateLimit(supabase, clientIP, "ip", "check-geofence");
    if (!rateCheck.allowed) {
      console.log(`Rate limit exceeded for geofence check from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Try again later.", allowed: true }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfter || 60)
          } 
        }
      );
    }

    const { employee_name, device, latitude, longitude }: GeofenceCheckRequest = await req.json();

    console.log(`[Geofence] Checking location for ${employee_name}: ${latitude}, ${longitude}`);

    // Get employee by name to find their assigned geofences
    const { data: employees, error: employeeError } = await supabase
      .from("employees")
      .select("id")
      .eq("name", employee_name)
      .single();

    if (employeeError || !employees) {
      console.log(`[Geofence] Employee not found: ${employee_name}`);
      // If employee not found, check against all active geofences
      const { data: allGeofences } = await supabase
        .from("geofences")
        .select("*")
        .eq("is_active", true);

      if (!allGeofences || allGeofences.length === 0) {
        return new Response(
          JSON.stringify({ allowed: true, message: "No geofences configured" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if inside any active geofence
      let isInsideAny = false;
      let nearestGeofence: Geofence | null = null;
      let nearestDistance = Infinity;

      for (const geofence of allGeofences as Geofence[]) {
        const distance = calculateDistance(latitude, longitude, geofence.latitude, geofence.longitude);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestGeofence = geofence;
        }
        if (distance <= geofence.radius_meters) {
          isInsideAny = true;
          break;
        }
      }

      if (!isInsideAny && nearestGeofence) {
        // Log violation
        await supabase.from("geofence_violations").insert({
          employee_name,
          device,
          latitude,
          longitude,
          nearest_geofence_id: nearestGeofence.id,
          distance_meters: Math.round(nearestDistance),
          action_taken: "alert",
        });

        console.log(`[Geofence] Violation detected for ${employee_name}, distance: ${Math.round(nearestDistance)}m`);

        return new Response(
          JSON.stringify({
            allowed: false,
            message: `Outside geofence. Nearest: ${nearestGeofence.name} (${Math.round(nearestDistance)}m away)`,
            nearest_geofence: nearestGeofence.name,
            distance_meters: Math.round(nearestDistance),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ allowed: true, message: "Inside allowed geofence" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get employee's assigned geofences
    const { data: employeeGeofences, error: geofencesError } = await supabase
      .from("employee_geofences")
      .select(`
        geofence_id,
        geofences (*)
      `)
      .eq("employee_id", employees.id);

    if (geofencesError) {
      console.error("[Geofence] Error fetching employee geofences:", geofencesError);
      throw geofencesError;
    }

    // If no geofences assigned to employee, allow access
    if (!employeeGeofences || employeeGeofences.length === 0) {
      console.log(`[Geofence] No geofences assigned to ${employee_name}, allowing access`);
      return new Response(
        JSON.stringify({ allowed: true, message: "No geofences assigned to employee" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if inside any assigned geofence
    let isInsideAssigned = false;
    let nearestGeofence: any = null;
    let nearestDistance = Infinity;

    for (const eg of employeeGeofences) {
      const geofence = eg.geofences as unknown as Geofence;
      if (!geofence || !geofence.is_active) continue;

      const distance = calculateDistance(latitude, longitude, geofence.latitude, geofence.longitude);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestGeofence = geofence;
      }
      if (distance <= geofence.radius_meters) {
        isInsideAssigned = true;
        console.log(`[Geofence] ${employee_name} is inside ${geofence.name}`);
        break;
      }
    }

    if (!isInsideAssigned && nearestGeofence) {
      // Log violation
      await supabase.from("geofence_violations").insert({
        employee_name,
        device,
        latitude,
        longitude,
        nearest_geofence_id: nearestGeofence.id,
        distance_meters: Math.round(nearestDistance),
        action_taken: "alert",
      });

      // Also create a security violation
      await supabase.from("security_violations").insert({
        employee_name,
        device,
        violation_type: "geofence_violation",
        policy_name: "Geofence Policy",
        severity: "high",
        description: `Funcionário detectado fora da área permitida. Distância da geofence mais próxima (${nearestGeofence.name}): ${Math.round(nearestDistance)}m`,
        location: `${latitude}, ${longitude}`,
      });

      console.log(`[Geofence] Violation detected for ${employee_name}, distance: ${Math.round(nearestDistance)}m from ${nearestGeofence.name}`);

      return new Response(
        JSON.stringify({
          allowed: false,
          message: `Outside assigned geofence. Nearest: ${nearestGeofence.name} (${Math.round(nearestDistance)}m away)`,
          nearest_geofence: nearestGeofence.name,
          distance_meters: Math.round(nearestDistance),
          should_block: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ allowed: true, message: "Inside assigned geofence" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[Geofence] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, allowed: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
