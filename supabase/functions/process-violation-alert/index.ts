import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ViolationAlertSchema = z.object({
  employee_name: z.string().min(1),
  violation_type: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  policy_name: z.string().min(1),
  description: z.string().max(2000).optional(),
  device: z.string().optional(),
  ip_address: z.string().optional(),
  location: z.string().optional(),
  screenshot_url: z.string().url().optional(),
  notify_managers: z.boolean().default(true),
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
      employee_name, violation_type, severity, policy_name,
      description, device, ip_address, location, screenshot_url,
      notify_managers,
    } = validation.data;

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Insert into security_violations (real table)
    const { data: violation, error: violationError } = await supabase
      .from('security_violations')
      .insert({
        employee_name,
        violation_type,
        severity,
        policy_name,
        description: description || null,
        device: device || null,
        ip_address: ip_address || null,
        location: location || null,
        screenshot_url: screenshot_url || null,
        read: false,
        notified_admin: false,
        notified_employee: false,
      })
      .select()
      .single();

    if (violationError) throw violationError;

    let notificationsSent = 0;

    // Notify via configured alert channels
    if (notify_managers) {
      // Check alert_notification_settings (real table)
      const { data: alertSettings } = await supabase
        .from('alert_notification_settings')
        .select('*')
        .eq('enabled', true)
        .limit(1)
        .maybeSingle();

      if (alertSettings) {
        const shouldNotify =
          (severity === 'critical' && alertSettings.notify_critical) ||
          (severity === 'high' && alertSettings.notify_high) ||
          (severity === 'medium' && alertSettings.notify_medium) ||
          (severity === 'low' && alertSettings.notify_low);

        if (shouldNotify && alertSettings.recipient_emails?.length) {
          // Send email notification
          try {
            await supabase.functions.invoke('send-email-notification', {
              body: {
                to: alertSettings.recipient_emails,
                subject: `🚨 Violação ${severity.toUpperCase()}: ${violation_type}`,
                html: `<p><strong>Funcionário:</strong> ${employee_name}</p>
                       <p><strong>Tipo:</strong> ${violation_type}</p>
                       <p><strong>Severidade:</strong> ${severity}</p>
                       <p><strong>Política:</strong> ${policy_name}</p>
                       <p>${description || ''}</p>`,
              },
            });
            notificationsSent++;
          } catch (e) {
            console.error('Email notification error:', e);
          }
        }
      }

      // Mark as notified
      await supabase.from('security_violations')
        .update({ notified_admin: true })
        .eq('id', violation.id);
    }

    // Log to settings_audit_log (real table)
    await supabase.from('settings_audit_log').insert({
      action: 'violation_processed',
      entity_type: 'security_violation',
      entity_id: violation.id,
      entity_name: `${violation_type} - ${employee_name}`,
      user_id: '00000000-0000-0000-0000-000000000000',
      user_email: 'system@sentinela.app',
      new_value: { severity, violation_type, notify_managers },
    });

    // Trigger webhooks for violation events
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('id')
      .eq('is_active', true)
      .contains('events', ['violation.created']);

    for (const wh of webhooks || []) {
      try {
        await supabase.functions.invoke('send-webhook', {
          body: {
            webhook_id: wh.id,
            event_type: 'violation.created',
            payload: {
              violation,
              timestamp: new Date().toISOString(),
            },
          },
        });
        notificationsSent++;
      } catch (e) {
        console.error('Webhook error:', e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        violation_id: violation.id,
        notifications_sent: notificationsSent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Process violation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
