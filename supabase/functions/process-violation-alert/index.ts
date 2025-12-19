// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// ============================================================
// VALIDAÇÃO DE INPUT
// ============================================================

interface ViolationAlertRequest {
  violation_id: string;
  employee_id: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, unknown>;
  notify_channels?: Array<'email' | 'whatsapp' | 'webhook' | 'push'>;
}

function validateUUID(value: unknown, fieldName: string): string {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} é obrigatório`);
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new Error(`${fieldName} deve ser um UUID válido`);
  }
  return value;
}

function validateString(value: unknown, fieldName: string, minLength = 1, maxLength = 500): string {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} é obrigatório`);
  }
  if (value.length < minLength || value.length > maxLength) {
    throw new Error(`${fieldName} deve ter entre ${minLength} e ${maxLength} caracteres`);
  }
  return value;
}

function validateSeverity(value: unknown): 'low' | 'medium' | 'high' | 'critical' {
  const allowed = ['low', 'medium', 'high', 'critical'];
  if (!allowed.includes(value as string)) {
    throw new Error(`severity deve ser: ${allowed.join(', ')}`);
  }
  return value as 'low' | 'medium' | 'high' | 'critical';
}

function validateChannels(value: unknown): Array<'email' | 'whatsapp' | 'webhook' | 'push'> | undefined {
  if (!value) return undefined;
  if (!Array.isArray(value)) {
    throw new Error('notify_channels deve ser um array');
  }
  const allowed = ['email', 'whatsapp', 'webhook', 'push'];
  for (const channel of value) {
    if (!allowed.includes(channel)) {
      throw new Error(`Canal inválido: ${channel}. Permitidos: ${allowed.join(', ')}`);
    }
  }
  return value as Array<'email' | 'whatsapp' | 'webhook' | 'push'>;
}

function validateRequest(data: unknown): ViolationAlertRequest {
  if (!data || typeof data !== 'object') {
    throw new Error('Request body inválido');
  }
  
  const obj = data as Record<string, unknown>;
  
  return {
    violation_id: validateUUID(obj.violation_id, 'violation_id'),
    employee_id: validateUUID(obj.employee_id, 'employee_id'),
    violation_type: validateString(obj.violation_type, 'violation_type'),
    severity: validateSeverity(obj.severity),
    details: obj.details as Record<string, unknown> | undefined,
    notify_channels: validateChannels(obj.notify_channels),
  };
}

// ============================================================
// CORS HEADERS
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// NOTIFICATION FUNCTIONS
// ============================================================

async function sendWhatsAppNotification(
  supabase: any,
  phone: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-whatsapp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({ to: phone, message }),
      }
    );
    return response.ok;
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return false;
  }
}

async function sendWebhookNotification(
  webhookUrl: string,
  payload: unknown
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    console.error('Webhook notification error:', error);
    return false;
  }
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'JSON inválido no body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    let validatedData: ViolationAlertRequest;
    try {
      validatedData = validateRequest(body);
    } catch (validationError: any) {
      return new Response(
        JSON.stringify({ error: validationError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get violation details
    const { data: violation, error: violationError } = await supabase
      .from('security_violations')
      .select('*, employees(name, email, phone, team_id)')
      .eq('id', validatedData.violation_id)
      .single();

    if (violationError || !violation) {
      return new Response(
        JSON.stringify({ error: 'Violação não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get alert settings
    const { data: alertSettings } = await supabase
      .from('alert_settings')
      .select('*')
      .single();

    const channels = validatedData.notify_channels || ['webhook'];
    const results: Record<string, boolean> = {};

    // Build notification message
    const severityEmoji = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🔶',
      critical: '🚨',
    };
    
    const message = `${severityEmoji[validatedData.severity]} *Alerta de Violação*

*Funcionário:* ${violation.employees?.name || 'N/A'}
*Tipo:* ${validatedData.violation_type}
*Severidade:* ${validatedData.severity.toUpperCase()}
*Data:* ${new Date().toLocaleString('pt-BR')}

${validatedData.details ? `*Detalhes:* ${JSON.stringify(validatedData.details)}` : ''}`;

    // Send WhatsApp
    if (channels.includes('whatsapp') && violation.employees?.phone) {
      results.whatsapp = await sendWhatsAppNotification(
        supabase,
        violation.employees.phone,
        message
      );
    }

    // Send Webhooks
    if (channels.includes('webhook')) {
      const { data: webhooks } = await supabase
        .from('webhooks')
        .select('url')
        .eq('is_active', true)
        .eq('event_type', 'violation_created');

      if (webhooks) {
        for (const webhook of webhooks) {
          const success = await sendWebhookNotification(webhook.url, {
            event: 'violation_alert',
            violation_id: validatedData.violation_id,
            employee_id: validatedData.employee_id,
            violation_type: validatedData.violation_type,
            severity: validatedData.severity,
            details: validatedData.details,
            timestamp: new Date().toISOString(),
          });
          results[`webhook_${webhook.url.substring(0, 30)}`] = success;
        }
      }
    }

    // Mark violation as notified
    await supabase
      .from('security_violations')
      .update({ 
        notification_sent: true,
        notification_sent_at: new Date().toISOString(),
      })
      .eq('id', validatedData.violation_id);

    // Log notification
    await supabase.from('audit_logs').insert({
      action: 'violation_notification_sent',
      entity_type: 'security_violation',
      entity_id: validatedData.violation_id,
      new_values: { channels, results },
      severity: validatedData.severity,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        violation_id: validatedData.violation_id,
        notifications_sent: results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
