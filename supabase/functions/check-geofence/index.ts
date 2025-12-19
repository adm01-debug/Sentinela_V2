import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimitConfig } from '../_shared/rateLimiting.ts';
import { 
  checkGeofenceSchema, 
  validateInput, 
  createValidationErrorResponse 
} from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 120,
  windowMs: 60 * 1000,
  identifier: 'check-geofence',
};

interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  coordinates: number[][];
  radius?: number;
  alert_on_enter: boolean;
  alert_on_exit: boolean;
}

function isPointInCircle(
  lat: number, 
  lng: number, 
  centerLat: number, 
  centerLng: number, 
  radiusKm: number
): boolean {
  const R = 6371; // Earth's radius in km
  const dLat = (centerLat - lat) * Math.PI / 180;
  const dLng = (centerLng - lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat * Math.PI / 180) * Math.cos(centerLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance <= radiusKm;
}

function isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, RATE_LIMIT_CONFIG);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = validateInput(checkGeofenceSchema, body);
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.error, validation.details, corsHeaders);
    }

    const { employee_id, latitude, longitude } = validation.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get active geofences
    const { data: geofences, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    const results: { geofence_id: string; inside: boolean; name: string }[] = [];
    const alerts: { type: 'enter' | 'exit'; geofence: Geofence }[] = [];

    // Get previous location state
    const { data: previousState } = await supabase
      .from('employee_geofence_state')
      .select('geofence_id, inside')
      .eq('employee_id', employee_id);

    const previousStateMap = new Map(
      previousState?.map(s => [s.geofence_id, s.inside]) || []
    );

    for (const geofence of geofences || []) {
      let inside = false;
      
      if (geofence.type === 'circle' && geofence.radius) {
        const [centerLng, centerLat] = geofence.coordinates[0];
        inside = isPointInCircle(latitude, longitude, centerLat, centerLng, geofence.radius / 1000);
      } else if (geofence.type === 'polygon') {
        inside = isPointInPolygon(latitude, longitude, geofence.coordinates);
      }

      results.push({ geofence_id: geofence.id, inside, name: geofence.name });

      // Check for enter/exit events
      const wasInside = previousStateMap.get(geofence.id) || false;
      
      if (inside && !wasInside && geofence.alert_on_enter) {
        alerts.push({ type: 'enter', geofence });
      } else if (!inside && wasInside && geofence.alert_on_exit) {
        alerts.push({ type: 'exit', geofence });
      }

      // Update state
      await supabase
        .from('employee_geofence_state')
        .upsert({
          employee_id,
          geofence_id: geofence.id,
          inside,
          updated_at: new Date().toISOString(),
        });
    }

    // Process alerts
    for (const alert of alerts) {
      await supabase.from('geofence_events').insert({
        employee_id,
        geofence_id: alert.geofence.id,
        event_type: alert.type,
        latitude,
        longitude,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        location: { latitude, longitude },
        geofences: results,
        alerts: alerts.map(a => ({ type: a.type, geofence_name: a.geofence.name })),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
