import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation Schemas
const ViolationAlertSchema = z.object({
  violation_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  violation_type: z.enum([
    'unauthorized_access',
    'data_leak',
    'policy_breach',
    'suspicious_activity',
    'geofence_breach',
    'time_violation',
    'app_violation',
    'url_violation',
    'keyword_detected',
    'excessive_idle',
    'unauthorized_software',
    'usb_violation',
    'print_violation',
    'other',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().max(2000).optional(),
  evidence: z.object({
    screenshot_id: z.string().uuid().optional(),
    url: z.string().url().optional(),
    app_name: z.string().optional(),
    keyword: z.string().optional(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    metadata: z.record(z.unknown()).optional(),
  }).optional(),
  notify_managers: z.boolean().default(true),
  auto_resolve: z.boolean().default(false),
});

const NotificationPrefsSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
  webhook: z.boolean().default(false),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'process-violation', 50, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validation = ViolationAlertSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      violation_id, 
      employee_id, 
      violation_type, 
      severity, 
      description, 
      evidence,
      notify_managers,
      auto_resolve 
    } = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get employee and their managers
    const { data: employee } = await supabase
      .from('employees')
      .select('*, teams(*, manager_id)')
      .eq('id', employee_id)
      .single();

    if (!employee) {
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create or update violation record
    const { data: violation, error: violationError } = await supabase
      .from('security_violations')
      .upsert({
        id: violation_id,
        employee_id,
        violation_type,
        severity,
        description,
        evidence,
        status: auto_resolve ? 'resolved' : 'open',
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (violationError) {
      throw violationError;
    }

    const notifications = [];

    // Notify managers if requested
    if (notify_managers && employee.teams?.manager_id) {
      // Get manager notification preferences
      const { data: managerPrefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', employee.teams.manager_id)
        .single();

      const prefs = NotificationPrefsSchema.parse(managerPrefs || {});

      // Create in-app notification
      const { data: notification } = await supabase
        .from('notifications')
        .insert({
          user_id: employee.teams.manager_id,
          type: 'violation_alert',
          title: `Violação ${severity.toUpperCase()}: ${violation_type}`,
          message: description || `Nova violação detectada para ${employee.name}`,
          data: { violation_id, employee_id, severity },
          read: false,
        })
        .select()
        .single();

      notifications.push(notification);

      // Send push notification if enabled
      if (prefs.push) {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: employee.teams.manager_id,
            title: `🚨 Violação ${severity.toUpperCase()}`,
            body: `${employee.name}: ${violation_type}`,
            data: { violation_id },
          },
        });
      }

      // Trigger webhook if enabled
      if (prefs.webhook) {
        const { data: webhooks } = await supabase
          .from('webhooks')
          .select('*')
          .eq('is_active', true)
          .contains('events', ['violation.created']);

        for (const webhook of webhooks || []) {
          await supabase.functions.invoke('send-webhook', {
            body: {
              webhook_id: webhook.id,
              event_type: 'violation.created',
              payload: {
                violation,
                employee: { id: employee.id, name: employee.name },
                timestamp: new Date().toISOString(),
              },
            },
          });
        }
      }
    }

    // Log audit entry
    await supabase.from('audit_logs').insert({
      action: 'violation_processed',
      entity_type: 'security_violation',
      entity_id: violation_id,
      details: { severity, violation_type, notify_managers },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        violation_id,
        notifications_sent: notifications.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Process violation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
