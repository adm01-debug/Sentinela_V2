import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agent-key',
};

// Validation Schema
const MobileDataSchema = z.object({
  employee_id: z.string().uuid().optional(),
  device_id: z.string().min(1).optional(),
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

// ============================================================
// AGENT KEY AUTHENTICATION
// ============================================================

interface AgentKeyData {
  id: string;
  agent_key: string;
  key_name: string;
  device_name: string | null;
  employee_name: string | null;
  is_active: boolean;
}

async function validateAgentKey(
  supabase: SupabaseClient,
  agentKey: string
): Promise<{ valid: boolean; data?: AgentKeyData; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('agent_keys')
      .select('id, agent_key, key_name, device_name, employee_name, is_active')
      .eq('agent_key', agentKey)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.log('Agent key validation failed:', error?.message || 'Key not found');
      return { valid: false, error: 'Invalid or inactive agent key' };
    }

    // Update last_seen_at
    await supabase
      .from('agent_keys')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', data.id);

    return { valid: true, data: data as AgentKeyData };
  } catch (err) {
    console.error('Agent key validation error:', err);
    return { valid: false, error: 'Authentication error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase first for auth check
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ============================================================
    // AGENT KEY AUTHENTICATION (REQUIRED)
    // ============================================================
    const agentKey = req.headers.get('x-agent-key');
    
    if (!agentKey) {
      console.log('Request rejected: No agent key provided');
      return new Response(
        JSON.stringify({ error: 'Agent key required', code: 'AUTH_REQUIRED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authResult = await validateAgentKey(supabase, agentKey);
    
    if (!authResult.valid || !authResult.data) {
      console.log('Request rejected: Invalid agent key');
      return new Response(
        JSON.stringify({ error: authResult.error || 'Invalid agent key', code: 'AUTH_FAILED' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authenticatedAgent = authResult.data;
    console.log(`Authenticated mobile agent: ${authenticatedAgent.key_name} (${authenticatedAgent.device_name || 'unknown device'})`);

    // ============================================================
    // RATE LIMITING (per agent key, not just IP)
    // ============================================================
    const rateLimitKey = `mobile:${authenticatedAgent.id}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, 'mobile-collector', 60, 60);
    
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

    const { location, battery, apps, network, timestamp } = validationResult.data;
    
    // Use authenticated values - IGNORE client-provided employee_id/device_id
    const device_id = authenticatedAgent.device_name || authenticatedAgent.key_name;
    const employee_name = authenticatedAgent.employee_name || 'Unknown';
    
    // Get employee_id from employees table
    let employee_id: string | null = null;
    if (authenticatedAgent.employee_name) {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('name', authenticatedAgent.employee_name)
        .single();
      
      if (employee) {
        employee_id = employee.id;
      }
    }

    const now = timestamp || new Date().toISOString();

    // Update device status in mobile_devices table
    await supabase.from('mobile_devices').upsert({
      device_id,
      employee_name,
      last_seen_at: now,
      os_type: 'mobile',
      is_active: true,
      last_location_lat: location?.latitude,
      last_location_lng: location?.longitude,
    }, { onConflict: 'device_id' });

    // Store location if provided
    if (location) {
      await supabase.from('mobile_activity_logs').insert({
        employee_name,
        activity_type: 'location',
        latitude: location.latitude,
        longitude: location.longitude,
        metadata: { accuracy: location.accuracy, altitude: location.altitude },
        recorded_at: now,
      });
    }

    // Store app usage if provided
    if (apps && apps.length > 0) {
      await supabase.from('mobile_activity_logs').insert(
        apps.map(app => ({
          employee_name,
          activity_type: 'app_usage',
          app_name: app.app_name,
          duration_seconds: app.usage_time,
          metadata: { package_name: app.package_name },
          recorded_at: now,
        }))
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
