import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agent-key',
};

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const ScreenshotDataSchema = z.object({
  image_base64: z.string().min(1),
  window_title: z.string().optional(),
  active_app: z.string().optional(),
  url: z.string().url().optional(),
});

const ActivityDataSchema = z.object({
  mouse_clicks: z.number().int().min(0).optional(),
  keystrokes: z.number().int().min(0).optional(),
  scroll_events: z.number().int().min(0).optional(),
  active_window: z.string().optional(),
  idle_time: z.number().min(0).optional(),
});

const ApplicationDataSchema = z.object({
  app_name: z.string().min(1),
  window_title: z.string().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  duration_seconds: z.number().int().min(0).optional(),
  is_productive: z.boolean().optional(),
  category: z.string().optional(),
});

const UrlDataSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  visit_time: z.string().datetime().optional(),
  duration_seconds: z.number().int().min(0).optional(),
  is_productive: z.boolean().optional(),
});

const KeystrokeDataSchema = z.object({
  total_keystrokes: z.number().int().min(0),
  words_typed: z.number().int().min(0).optional(),
  special_keys: z.number().int().min(0).optional(),
  window_title: z.string().optional(),
  app_name: z.string().optional(),
});

const SystemInfoDataSchema = z.object({
  cpu_usage: z.number().min(0).max(100).optional(),
  memory_usage: z.number().min(0).max(100).optional(),
  disk_usage: z.number().min(0).max(100).optional(),
  network_up: z.number().min(0).optional(),
  network_down: z.number().min(0).optional(),
  os_version: z.string().optional(),
  hostname: z.string().optional(),
});

const AgentDataSchema = z.object({
  employee_id: z.string().uuid().optional(),
  device_id: z.string().min(1).max(255).optional(),
  data_type: z.enum([
    'screenshot',
    'activity',
    'application',
    'url',
    'keystroke',
    'system_info',
    'idle',
    'login',
    'logout',
  ]),
  data: z.record(z.unknown()),
  timestamp: z.string().datetime().optional(),
  session_id: z.string().uuid().optional(),
  agent_version: z.string().optional(),
});

// ============================================================
// TYPE-SPECIFIC VALIDATORS
// ============================================================

function validateDataByType(dataType: string, data: Record<string, unknown>) {
  switch (dataType) {
    case 'screenshot':
      return ScreenshotDataSchema.safeParse(data);
    case 'activity':
      return ActivityDataSchema.safeParse(data);
    case 'application':
      return ApplicationDataSchema.safeParse(data);
    case 'url':
      return UrlDataSchema.safeParse(data);
    case 'keystroke':
      return KeystrokeDataSchema.safeParse(data);
    case 'system_info':
      return SystemInfoDataSchema.safeParse(data);
    default:
      return { success: true, data };
  }
}

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

// ============================================================
// MAIN HANDLER
// ============================================================

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
    console.log(`Authenticated agent: ${authenticatedAgent.key_name} (${authenticatedAgent.device_name || 'unknown device'})`);

    // ============================================================
    // RATE LIMITING (per agent key, not just IP)
    // ============================================================
    const rateLimitKey = `agent:${authenticatedAgent.id}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, 'agent-collector', 100, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          retry_after: rateLimitResult.retryAfter 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate main schema
    const body = await req.json();
    const mainValidation = AgentDataSchema.safeParse(body);
    
    if (!mainValidation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: mainValidation.error.flatten() 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data_type, data, timestamp, session_id, agent_version } = mainValidation.data;
    
    // Use authenticated values - IGNORE client-provided employee_id/device_id
    const device_id = authenticatedAgent.device_name || authenticatedAgent.key_name;
    
    // Get employee_id from employees table using employee_name from agent_key
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

    // Validate type-specific data
    const dataValidation = validateDataByType(data_type, data as Record<string, unknown>);
    if (!dataValidation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Data validation failed', 
          data_type,
          details: 'error' in dataValidation ? dataValidation.error : 'Invalid data format'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = timestamp || new Date().toISOString();

    // Update device last seen (if we have employee_id)
    if (employee_id) {
      try {
        await supabase.from('employee_devices').upsert({
          device_name: device_id,
          employee_id,
          agent_key_id: authenticatedAgent.id,
          assigned_at: now,
        }, { onConflict: 'employee_id,device_name' });
      } catch {
        // Ignore upsert errors - device tracking is secondary
      }
    }

    // Process by data type
    let result: { error: { message: string } | null } | undefined;
    
    switch (data_type) {
      case 'screenshot': {
        const screenshotData = data as z.infer<typeof ScreenshotDataSchema>;
        
        // Store screenshot in storage bucket
        const fileName = `${employee_id || 'unknown'}/${device_id}/${Date.now()}.jpg`;
        const imageBuffer = Uint8Array.from(atob(screenshotData.image_base64), c => c.charCodeAt(0));
        
        const { error: uploadError } = await supabase.storage
          .from('violation-screenshots')
          .upload(fileName, imageBuffer, { contentType: 'image/jpeg' });

        if (!uploadError) {
          result = await supabase.from('screen_captures').insert({
            employee_name: authenticatedAgent.employee_name || 'Unknown',
            device: device_id,
            capture_url: fileName,
            window_title: screenshotData.window_title,
            app_name: screenshotData.active_app,
            captured_at: now,
          });
        }
        break;
      }

      case 'activity': {
        const activityData = data as z.infer<typeof ActivityDataSchema>;
        result = await supabase.from('keystroke_logs').insert({
          employee_name: authenticatedAgent.employee_name || 'Unknown',
          device: device_id,
          keystrokes_count: activityData.keystrokes || 0,
          active_time_seconds: 60 - (activityData.idle_time || 0),
          idle_time_seconds: activityData.idle_time || 0,
          recorded_at: now,
        });
        break;
      }

      case 'application': {
        const appData = data as z.infer<typeof ApplicationDataSchema>;
        result = await supabase.from('productivity_logs').insert({
          employee_name: authenticatedAgent.employee_name || 'Unknown',
          device: device_id,
          productive_time_seconds: appData.is_productive ? (appData.duration_seconds || 0) : 0,
          unproductive_time_seconds: appData.is_productive === false ? (appData.duration_seconds || 0) : 0,
          neutral_time_seconds: appData.is_productive === undefined ? (appData.duration_seconds || 0) : 0,
          apps_used: [{ app_name: appData.app_name, category: appData.category, duration: appData.duration_seconds }],
          recorded_date: now.split('T')[0],
        });
        break;
      }

      case 'url': {
        const urlData = data as z.infer<typeof UrlDataSchema>;
        result = await supabase.from('click_logs').insert({
          employee_name: authenticatedAgent.employee_name || 'Unknown',
          device: device_id,
          url: urlData.url,
          window_title: urlData.title,
          click_type: 'navigation',
          recorded_at: now,
        });
        break;
      }

      case 'keystroke': {
        const keystrokeData = data as z.infer<typeof KeystrokeDataSchema>;
        result = await supabase.from('keystroke_logs').insert({
          employee_name: authenticatedAgent.employee_name || 'Unknown',
          device: device_id,
          keystrokes_count: keystrokeData.total_keystrokes,
          app_name: keystrokeData.app_name,
          recorded_at: now,
        });
        break;
      }

      case 'system_info': {
        // System info doesn't have a dedicated table, log for debugging
        console.log('System info received:', JSON.stringify(data));
        result = { error: null };
        break;
      }

      case 'login':
      case 'logout': {
        result = await supabase.from('station_block_logs').insert({
          employee_name: authenticatedAgent.employee_name || 'Unknown',
          device: device_id,
          block_type: data_type === 'login' ? 'session_start' : 'session_end',
          blocked_at: now,
          unblocked_at: data_type === 'logout' ? now : null,
        });
        break;
      }

      case 'idle': {
        result = await supabase.from('keystroke_logs').insert({
          employee_name: authenticatedAgent.employee_name || 'Unknown',
          device: device_id,
          keystrokes_count: 0,
          active_time_seconds: 0,
          idle_time_seconds: (data as { duration_seconds?: number }).duration_seconds || 0,
          recorded_at: now,
        });
        break;
      }

      default:
        console.log(`Unknown data type: ${data_type}`);
        result = { error: null };
    }

    if (result?.error) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ error: 'Failed to store data', details: result.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data_type, timestamp: now }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Agent collector error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
