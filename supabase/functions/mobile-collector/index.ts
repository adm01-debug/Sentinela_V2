import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation Schema
const MobileDataSchema = z.object({
  employee_id: z.string().uuid(),
  device_id: z.string().min(1),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().optional(),
    altitude: z.number().optional(),
  }).optional(),
  battery: z.object({
    level: z.number().min(0).max(100),
    is_charging: z.boolean(),
  }).optional(),
  apps: z.array(z.object({
    package_name: z.string(),
    app_name: z.string(),
    usage_time: z.number().optional(),
  })).optional(),
  network: z.object({
    type: z.enum(['wifi', 'cellular', 'none']),
    ssid: z.string().optional(),
  }).optional(),
  timestamp: z.string().datetime().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'mobile-collector', 60, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', retry_after: rateLimitResult.retryAfter }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    
    const validationResult = MobileDataSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { employee_id, device_id, location, battery, apps, network, timestamp } = validationResult.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = timestamp || new Date().toISOString();

    // Update device status
    await supabase.from('mobile_devices').upsert({
      device_id,
      employee_id,
      last_seen: now,
      battery_level: battery?.level,
      is_charging: battery?.is_charging,
      network_type: network?.type,
      network_ssid: network?.ssid,
    }, { onConflict: 'device_id' });

    // Store location if provided
    if (location) {
      await supabase.from('device_locations').insert({
        device_id,
        employee_id,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        altitude: location.altitude,
        recorded_at: now,
      });
    }

    // Store app usage if provided
    if (apps && apps.length > 0) {
      await supabase.from('app_usage').insert(
        apps.map(app => ({
          device_id,
          employee_id,
          package_name: app.package_name,
          app_name: app.app_name,
          usage_time: app.usage_time,
          recorded_at: now,
        }))
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
