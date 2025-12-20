import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  employee_id: z.string().uuid(),
  device_id: z.string().min(1).max(255),
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
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'agent-collector', 100, 60);
    
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

    const { employee_id, device_id, data_type, data, timestamp, session_id, agent_version } = mainValidation.data;

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

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = timestamp || new Date().toISOString();

    // Update device last seen
    await supabase.from('devices').upsert({
      device_id,
      employee_id,
      last_seen: now,
      agent_version,
      is_online: true,
    }, { onConflict: 'device_id' });

    // Process by data type
    let result;
    
    switch (data_type) {
      case 'screenshot': {
        const screenshotData = data as z.infer<typeof ScreenshotDataSchema>;
        
        // Store screenshot in storage bucket
        const fileName = `${employee_id}/${device_id}/${Date.now()}.jpg`;
        const imageBuffer = Uint8Array.from(atob(screenshotData.image_base64), c => c.charCodeAt(0));
        
        const { error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(fileName, imageBuffer, { contentType: 'image/jpeg' });

        if (!uploadError) {
          result = await supabase.from('screenshots').insert({
            employee_id,
            device_id,
            file_path: fileName,
            window_title: screenshotData.window_title,
            active_app: screenshotData.active_app,
            url: screenshotData.url,
            captured_at: now,
          });
        }
        break;
      }

      case 'activity': {
        const activityData = data as z.infer<typeof ActivityDataSchema>;
        result = await supabase.from('activity_logs').insert({
          employee_id,
          device_id,
          mouse_clicks: activityData.mouse_clicks || 0,
          keystrokes: activityData.keystrokes || 0,
          scroll_events: activityData.scroll_events || 0,
          active_window: activityData.active_window,
          idle_time: activityData.idle_time || 0,
          recorded_at: now,
        });
        break;
      }

      case 'application': {
        const appData = data as z.infer<typeof ApplicationDataSchema>;
        result = await supabase.from('application_usage').insert({
          employee_id,
          device_id,
          app_name: appData.app_name,
          window_title: appData.window_title,
          start_time: appData.start_time || now,
          end_time: appData.end_time,
          duration_seconds: appData.duration_seconds || 0,
          is_productive: appData.is_productive,
          category: appData.category,
        });
        break;
      }

      case 'url': {
        const urlData = data as z.infer<typeof UrlDataSchema>;
        result = await supabase.from('url_visits').insert({
          employee_id,
          device_id,
          url: urlData.url,
          title: urlData.title,
          visit_time: urlData.visit_time || now,
          duration_seconds: urlData.duration_seconds || 0,
          is_productive: urlData.is_productive,
        });
        break;
      }

      case 'keystroke': {
        const keystrokeData = data as z.infer<typeof KeystrokeDataSchema>;
        result = await supabase.from('keystroke_logs').insert({
          employee_id,
          device_id,
          total_keystrokes: keystrokeData.total_keystrokes,
          words_typed: keystrokeData.words_typed || 0,
          special_keys: keystrokeData.special_keys || 0,
          window_title: keystrokeData.window_title,
          app_name: keystrokeData.app_name,
          recorded_at: now,
        });
        break;
      }

      case 'system_info': {
        const sysData = data as z.infer<typeof SystemInfoDataSchema>;
        result = await supabase.from('system_metrics').insert({
          employee_id,
          device_id,
          cpu_usage: sysData.cpu_usage,
          memory_usage: sysData.memory_usage,
          disk_usage: sysData.disk_usage,
          network_up: sysData.network_up,
          network_down: sysData.network_down,
          recorded_at: now,
        });
        break;
      }

      case 'login':
      case 'logout': {
        result = await supabase.from('session_logs').insert({
          employee_id,
          device_id,
          event_type: data_type,
          session_id,
          occurred_at: now,
        });
        break;
      }

      case 'idle': {
        result = await supabase.from('idle_logs').insert({
          employee_id,
          device_id,
          started_at: now,
          duration_seconds: (data as any).duration_seconds || 0,
        });
        break;
      }

      default:
        // Generic data storage
        result = await supabase.from('agent_data').insert({
          employee_id,
          device_id,
          data_type,
          data,
          recorded_at: now,
        });
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

  } catch (error) {
    console.error('Agent collector error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
