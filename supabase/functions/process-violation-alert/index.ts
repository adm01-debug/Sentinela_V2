import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Violation {
  id: string;
  employee_name: string;
  violation_type: string;
  severity: string;
  description?: string;
  device?: string;
  created_at: string;
  policy_name: string;
}

interface WhatsAppSettings {
  enabled: boolean;
  phone_number_id: string | null;
  recipient_numbers: string[];
  notify_critical: boolean;
  notify_high: boolean;
  notify_medium: boolean;
  notify_low: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get unnotified critical/high violations
    const { data: violations, error: fetchError } = await supabase
      .from('security_violations')
      .select('*')
      .in('severity', ['critical', 'high', 'medium', 'low'])
      .eq('notified_admin', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    if (!violations || violations.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No new violations to process', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${violations.length} violations`);

    // Get violation rules to check notification settings
    const { data: rules } = await supabase
      .from('violation_rules')
      .select('rule_type, notify_admin, notify_employee')
      .eq('is_active', true);

    const rulesMap = new Map(rules?.map(r => [r.rule_type, r]) || []);

    // Get WhatsApp settings
    const { data: whatsappSettings } = await supabase
      .from('whatsapp_notification_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    const whatsapp = whatsappSettings as WhatsAppSettings | null;
    const whatsappEnabled = whatsapp?.enabled && whatsapp?.phone_number_id && whatsapp?.recipient_numbers?.length > 0;
    
    console.log(`WhatsApp notifications ${whatsappEnabled ? 'enabled' : 'disabled'}`);

    // Process each violation
    const notificationResults = [];
    const whatsappResults = [];

    for (const violation of violations as Violation[]) {
      const rule = rulesMap.get(violation.violation_type);
      const shouldNotifyAdmin = rule?.notify_admin !== false;
      const shouldNotifyEmployee = rule?.notify_employee === true;

      // Check if should send WhatsApp for this severity
      const shouldSendWhatsApp = whatsappEnabled && shouldNotifyForSeverity(violation.severity, whatsapp!);

      if (!shouldNotifyAdmin && !shouldSendWhatsApp) {
        // Mark as processed but don't send
        await supabase
          .from('security_violations')
          .update({ notified_admin: true })
          .eq('id', violation.id);
        continue;
      }

      // Send push notification if enabled
      if (shouldNotifyAdmin) {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: `Violação ${violation.severity === 'critical' ? 'Crítica' : 'Alta'} Detectada`,
              body: `${violation.employee_name}: ${violation.description || violation.policy_name}`,
              severity: violation.severity,
              violation_id: violation.id,
              data: {
                employee_name: violation.employee_name,
                device: violation.device,
                violation_type: violation.violation_type,
                timestamp: violation.created_at,
                notify_employee: shouldNotifyEmployee
              }
            }),
          });

          if (response.ok) {
            notificationResults.push({ id: violation.id, status: 'sent' });
          } else {
            const errorText = await response.text();
            console.error(`Failed to send push notification for violation ${violation.id}:`, errorText);
            notificationResults.push({ id: violation.id, status: 'failed', error: errorText });
          }
        } catch (notifyError) {
          console.error(`Error sending push notification for violation ${violation.id}:`, notifyError);
          notificationResults.push({ id: violation.id, status: 'error' });
        }
      }

      // Send WhatsApp notification if enabled
      if (shouldSendWhatsApp) {
        try {
          const whatsappResult = await sendWhatsAppAlert(
            supabaseUrl,
            supabaseServiceKey,
            violation,
            whatsapp!
          );
          whatsappResults.push({ id: violation.id, ...whatsappResult });
        } catch (whatsappError) {
          console.error(`Error sending WhatsApp for violation ${violation.id}:`, whatsappError);
          whatsappResults.push({ id: violation.id, status: 'error' });
        }
      }

      // Mark violation as notified
      await supabase
        .from('security_violations')
        .update({ notified_admin: true })
        .eq('id', violation.id);
    }

    const pushSentCount = notificationResults.filter(r => r.status === 'sent').length;
    const whatsappSentCount = whatsappResults.filter(r => r.status === 'sent').length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${violations.length} violations`,
        count: violations.length,
        push_sent: pushSentCount,
        whatsapp_sent: whatsappSentCount,
        push_results: notificationResults,
        whatsapp_results: whatsappResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Process violation alert error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function shouldNotifyForSeverity(severity: string, settings: WhatsAppSettings): boolean {
  switch (severity) {
    case 'critical':
      return settings.notify_critical;
    case 'high':
      return settings.notify_high;
    case 'medium':
      return settings.notify_medium;
    case 'low':
      return settings.notify_low;
    default:
      return false;
  }
}

async function sendWhatsAppAlert(
  supabaseUrl: string,
  supabaseServiceKey: string,
  violation: Violation,
  settings: WhatsAppSettings
): Promise<{ status: string; results?: unknown[] }> {
  const severityEmoji: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };

  const emoji = severityEmoji[violation.severity] || '⚪';
  const severityLabel = violation.severity.toUpperCase();
  const timestamp = new Date(violation.created_at).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `${emoji} *ALERTA DE VIOLAÇÃO*

👤 Funcionário: ${violation.employee_name}
📋 Tipo: ${violation.violation_type}
🔒 Política: ${violation.policy_name}
⚠️ Severidade: ${severityLabel}
📝 Descrição: ${violation.description || 'N/A'}
💻 Dispositivo: ${violation.device || 'N/A'}
🕐 Data/Hora: ${timestamp}

---
Sistema de Monitoramento SecureWatch`;

  console.log(`Sending WhatsApp alert to ${settings.recipient_numbers.length} recipients`);

  const response = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient_numbers: settings.recipient_numbers,
      message,
      message_type: 'violation_alert',
      violation_id: violation.id,
      phone_number_id: settings.phone_number_id,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('WhatsApp API error:', errorText);
    return { status: 'failed' };
  }

  const data = await response.json();
  return { status: 'sent', results: data.results };
}
