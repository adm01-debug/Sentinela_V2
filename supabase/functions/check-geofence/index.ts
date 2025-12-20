import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation Schemas
const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
  altitude: z.number().optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
});

const GeofenceCheckSchema = z.object({
  employee_id: z.string().uuid(),
  device_id: z.string().min(1).max(255),
  location: LocationSchema,
  timestamp: z.string().datetime().optional(),
  check_all: z.boolean().default(false),
  geofence_ids: z.array(z.string().uuid()).optional(),
});

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

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

// Check if point is within radius of center (haversine formula)
function isPointInRadius(
  point: { latitude: number; longitude: number },
  center: { latitude: number; longitude: number },
  radiusMeters: number
): boolean {
  const R = 6371000; // Earth radius in meters
  const dLat = (point.latitude - center.latitude) * Math.PI / 180;
  const dLon = (point.longitude - center.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(center.latitude * Math.PI / 180) * Math.cos(point.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance <= radiusMeters;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'check-geofence', 120, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validation = GeofenceCheckSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { employee_id, device_id, location, timestamp, check_all, geofence_ids } = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = timestamp || new Date().toISOString();

    // Get geofences to check
    let query = supabase.from('geofences').select('*').eq('is_active', true);
    
    if (!check_all && geofence_ids?.length) {
      query = query.in('id', geofence_ids);
    }

    const { data: geofences, error: geoError } = await query;

    if (geoError) throw geoError;

    const results: Array<{
      geofence_id: string;
      geofence_name: string;
      is_inside: boolean;
      event_type?: 'enter' | 'exit' | 'stay';
    }> = [];

    const violations: string[] = [];

    // Get previous location state for this employee
    const { data: previousState } = await supabase
      .from('geofence_states')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('device_id', device_id);

    const previousStates = new Map(
      previousState?.map(s => [s.geofence_id, s.is_inside]) || []
    );

    for (const geofence of geofences || []) {
      let isInside = false;

      // Check based on geofence type
      if (geofence.geometry?.type === 'polygon' && geofence.geometry?.coordinates) {
        const polygon = geofence.geometry.coordinates.map((c: number[]) => ({
          latitude: c[1],
          longitude: c[0],
        }));
        isInside = isPointInPolygon(location, polygon);
      } else if (geofence.center_lat && geofence.center_lng && geofence.radius) {
        isInside = isPointInRadius(
          location,
          { latitude: geofence.center_lat, longitude: geofence.center_lng },
          geofence.radius
        );
      }

      const wasInside = previousStates.get(geofence.id);
      let eventType: 'enter' | 'exit' | 'stay' | undefined;

      if (wasInside === undefined) {
        eventType = isInside ? 'enter' : undefined;
      } else if (wasInside && !isInside) {
        eventType = 'exit';
      } else if (!wasInside && isInside) {
        eventType = 'enter';
      } else if (wasInside && isInside) {
        eventType = 'stay';
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

      // Update state
      await supabase.from('geofence_states').upsert({
        employee_id,
        device_id,
        geofence_id: geofence.id,
        is_inside: isInside,
        last_checked: now,
      }, { onConflict: 'employee_id,device_id,geofence_id' });

      // Log event if state changed
      if (eventType === 'enter' || eventType === 'exit') {
        await supabase.from('geofence_events').insert({
          employee_id,
          device_id,
          geofence_id: geofence.id,
          event_type: eventType,
          location: { lat: location.latitude, lng: location.longitude },
          occurred_at: now,
        });
      }
    }

    // Create violations if any
    for (const geofenceId of violations) {
      await supabase.functions.invoke('process-violation-alert', {
        body: {
          violation_id: crypto.randomUUID(),
          employee_id,
          violation_type: 'geofence_breach',
          severity: 'high',
          description: `Employee breached geofence ${geofenceId}`,
          evidence: {
            location,
            metadata: { geofence_id: geofenceId },
          },
        },
      });
    }

    // Update employee location
    await supabase.from('employee_locations').upsert({
      employee_id,
      device_id,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      recorded_at: now,
    }, { onConflict: 'employee_id,device_id' });

    return new Response(
      JSON.stringify({
        success: true,
        results,
        violations_count: violations.length,
        timestamp: now,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Geofence check error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
