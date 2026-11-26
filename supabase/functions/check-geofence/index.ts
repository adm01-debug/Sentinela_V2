import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit } from "../_shared/rateLimiting.ts";
import { checkGeofenceSchemaV1, checkGeofenceSchemaV2 } from "../_shared/schemas.ts";
import {
  validateInput,
  createValidationErrorResponse,
  getApiVersion,
} from "../_shared/validation.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { Logger } from "../_shared/logger.ts";
import { callerCompanyScope, requireUserOrServiceRole, withCompanyScope } from "../_shared/auth.ts";

// Point in polygon check using ray casting algorithm
function isPointInPolygon(
  point: { latitude: number; longitude: number },
  polygon: { latitude: number; longitude: number }[]
): boolean {
  let inside = false;
  const x = point.longitude;
  const y = point.latitude;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

// Distancia em metros entre dois pontos (haversine)
function haversineMeters(
  point: { latitude: number; longitude: number },
  center: { latitude: number; longitude: number }
): number {
  const R = 6371000;
  const dLat = ((point.latitude - center.latitude) * Math.PI) / 180;
  const dLon = ((point.longitude - center.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((center.latitude * Math.PI) / 180) *
      Math.cos((point.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Check if point is within radius of center (haversine formula)
function isPointInRadius(
  point: { latitude: number; longitude: number },
  center: { latitude: number; longitude: number },
  radiusMeters: number
): boolean {
  const R = 6371000; // Earth radius in meters
  const dLat = ((point.latitude - center.latitude) * Math.PI) / 180;
  const dLon = ((point.longitude - center.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((center.latitude * Math.PI) / 180) *
      Math.cos((point.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusMeters;
}

serve(async (req) => {
  const logger = new Logger("check-geofence");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // verify_jwt = true aceita a chave publicavel no gateway, entao o gate real
    // precisa acontecer aqui: sem ele qualquer visitante grava em
    // geofence_violations e dispara process-violation-alert (service_role).
    let auth: Awaited<ReturnType<typeof requireUserOrServiceRole>>;
    try {
      auth = await requireUserOrServiceRole(req);
    } catch {
      await logger.log(supabase, {
        method: req.method,
        status: 401,
        error_message: "Unauthorized",
      });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await checkRateLimit(clientIP, "check-geofence", 120, 60);

    if (!rateLimitResult.allowed) {
      await logger.log(supabase, {
        method: req.method,
        status: 429,
        error_message: "Rate limit exceeded",
      });
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const version = getApiVersion(req);

    let validatedData;
    if (version === "v2") {
      const validation = validateInput(checkGeofenceSchemaV2, body);
      if (!validation.success) {
        await logger.log(supabase, {
          method: req.method,
          status: 422,
          error_message: validation.error,
          payload_summary: { version, body_keys: Object.keys(body) },
        });
        return createValidationErrorResponse(validation.error, validation.details, corsHeaders);
      }
      validatedData = validation.data;
    } else {
      const validation = validateInput(checkGeofenceSchemaV1, body);
      if (!validation.success) {
        await logger.log(supabase, {
          method: req.method,
          status: 422,
          error_message: validation.error,
          payload_summary: { version, body_keys: Object.keys(body) },
        });
        return createValidationErrorResponse(validation.error, validation.details, corsHeaders);
      }
      // Map v1 to v2 structure for internal processing
      const v1 = validation.data;
      validatedData = {
        employee_id: v1.employee_id,
        device_id: "v1-legacy",
        location: {
          latitude: v1.latitude,
          longitude: v1.longitude,
          accuracy: v1.accuracy,
        },
        timestamp: v1.timestamp,
        check_all: true,
      };
    }

    const { employee_id, device_id, location, timestamp, check_all, geofence_ids } = validatedData;

    const now = timestamp || new Date().toISOString();

    // Get geofences to check
    // A leitura roda com service_role (ignora RLS): sem escopo de empresa o
    // chamador recebe o nome das cercas de todas as empresas e grava estado
    // nelas (geofence_violations) alem de disparar alerta de violacao.
    const scope = await callerCompanyScope(supabase, auth);
    let query = withCompanyScope(
      supabase.from("geofences").select("*").eq("is_active", true),
      scope
    );

    if (!check_all && geofence_ids?.length) {
      query = query.in("id", geofence_ids);
    }

    const { data: geofences, error: geoError } = await query;

    if (geoError) throw geoError;

    const results: Array<{
      geofence_id: string;
      geofence_name: string;
      is_inside: boolean;
      event_type?: "enter" | "exit" | "stay";
    }> = [];

    const violations: string[] = [];

    // Estado anterior por cerca vem de geofence_states (uma linha por
    // funcionario/device/cerca); geofence_violations guarda violacao, nao estado.
    const { data: previousState } = await supabase
      .from("geofence_states")
      .select("geofence_id, is_inside")
      .eq("employee_id", employee_id)
      .eq("device_id", device_id);

    const previousStates = new Map(
      (previousState ?? []).map((s) => [s.geofence_id, s.is_inside === true])
    );
    const knownStates = new Set((previousState ?? []).map((s) => s.geofence_id));

    for (const geofence of geofences || []) {
      let isInside = false;

      // Check based on geofence type
      if (
        (geofence.geometry?.type === "Polygon" || geofence.geometry?.type === "polygon") &&
        geofence.geometry?.coordinates
      ) {
        const polygon = geofence.geometry.coordinates[0].map((c: number[]) => ({
          latitude: c[1],
          longitude: c[0],
        }));
        isInside = isPointInPolygon(location, polygon);
      } else if (
        geofence.latitude != null &&
        geofence.longitude != null &&
        geofence.radius_meters
      ) {
        isInside = isPointInRadius(
          location,
          { latitude: geofence.latitude, longitude: geofence.longitude },
          geofence.radius_meters
        );
      }

      const wasInside = previousStates.get(geofence.id);
      let eventType: "enter" | "exit" | "stay" | undefined;

      if (wasInside === undefined) {
        eventType = isInside ? "enter" : undefined;
      } else if (wasInside && !isInside) {
        eventType = "exit";
      } else if (!wasInside && isInside) {
        eventType = "enter";
      } else if (wasInside && isInside) {
        eventType = "stay";
      }

      results.push({
        geofence_id: geofence.id,
        geofence_name: geofence.name,
        is_inside: isInside,
        event_type: eventType,
      });

      // Check for violations
      if (geofence.restricted && isInside) {
        violations.push(geofence.id);
      }
      if (geofence.required && !isInside) {
        violations.push(geofence.id);
      }

      // Estado atual em geofence_states (sobrescreve a linha do par
      // funcionario/device/cerca). Nao grava em geofence_violations: aquela
      // tabela alimenta a tela de violacoes e so recebe violacao de verdade.
      if (knownStates.has(geofence.id)) {
        const { error: stateError } = await supabase
          .from("geofence_states")
          .update({ is_inside: isInside, last_checked: now })
          .eq("employee_id", employee_id)
          .eq("device_id", device_id)
          .eq("geofence_id", geofence.id);
        if (stateError) throw stateError;
      } else {
        const { error: stateError } = await supabase.from("geofence_states").insert({
          employee_id,
          device_id,
          geofence_id: geofence.id,
          is_inside: isInside,
          last_checked: now,
        });
        if (stateError) throw stateError;
        knownStates.add(geofence.id);
      }

      // Historico de entrada/saida: so registra transicao (enter/exit).
      if (eventType === "enter" || eventType === "exit") {
        const { error: eventError } = await supabase.from("geofence_events").insert({
          employee_id,
          device_id,
          geofence_id: geofence.id,
          event_type: eventType,
          location,
          occurred_at: now,
        });
        if (eventError) throw eventError;
      }

      // Violacao de verdade: cerca restrita invadida ou cerca obrigatoria
      // abandonada. Antes disso o insert acontecia para toda checagem e
      // enchia a tela de violacoes com registros que nao eram violacao.
      if ((geofence.restricted && isInside) || (geofence.required && !isInside)) {
        await supabase.from("geofence_violations").insert({
          // a cerca carrega o dono da empresa; `employee_name` aqui recebe o id do
          // funcionario, então o trigger de preenchimento não consegue resolver
          company_id: geofence.company_id ?? scope,
          employee_name: employee_id,
          device: device_id,
          nearest_geofence_id: geofence.id,
          latitude: location.latitude,
          longitude: location.longitude,
          distance_meters: Math.round(
            haversineMeters(location, {
              latitude: geofence.latitude,
              longitude: geofence.longitude,
            })
          ),
          action_taken: isInside ? "inside" : "outside",
        });
      }
    }

    // Create violations if any
    for (const geofenceId of violations) {
      await supabase.functions.invoke("process-violation-alert", {
        body: {
          violation_id: crypto.randomUUID(),
          employee_id,
          violation_type: "geofence_breach",
          severity: "high",
          description: `Employee breached geofence ${geofenceId}`,
          evidence: {
            location,
            metadata: { geofence_id: geofenceId },
          },
        },
      });
    }

    await logger.log(supabase, {
      method: req.method,
      status: 200,
      employee_id,
      payload_summary: { results_count: results.length, violations_count: violations.length },
    });

    return new Response(
      JSON.stringify({
        success: true,
        results,
        violations_count: violations.length,
        timestamp: now,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Geofence check error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    await logger.log(supabase, {
      method: req.method,
      status: 500,
      error_message: message,
    });

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
