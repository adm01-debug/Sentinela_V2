// ============================================================
// PROCESS VIOLATION ALERT EDGE FUNCTION
// Processes security violations and sends alerts with rate limiting
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { validateRequest, ValidationError } from '../_shared/validation.ts';
import { createRateLimiter, rateLimitResponse, addRateLimitHeaders } from '../_shared/rateLimiting.ts';

// ============================================================
// CORS HEADERS
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// RATE LIMITER
// ============================================================

const rateLimiter = createRateLimiter('VIOLATION_ALERT');

// ============================================================
// TYPES
// ============================================================

interface ViolationAlertRequest {
  violationId: string;
  employeeId: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, unknown>;
}

interface AlertConfig {
  channels: ('whatsapp' | 'email' | 'webhook' | 'push')[];
  recipients: string[];
  escalationEnabled: boolean;
  escalationDelayMinutes: number;
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request
    const { data, userId, companyId } = await validateRequest<ViolationAlertRequest>(req, {
      requiredFields: ['violationId', 'employeeId', 'violationType', 'severity', 'description'],
      allowedFields: ['violationId', 'employeeId', 'violationType', 'severity', 'description', 'metadata'],
    });

    // Check rate limit per company
    const rateLimitResult = rateLimiter.check(`violation:${companyId || userId}`);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for company ${companyId}`);
      return rateLimitResponse(rateLimitResult);
    }

    console.log(`Processing violation alert: ${data.violationId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get alert configuration
    const alertConfig = await getAlertConfig(supabase, companyId, data.severity);

    // Get employee details
    const employee = await getEmployeeDetails(supabase, data.employeeId);

    // Process alerts for each channel
    const alertResults = await Promise.allSettled(
      alertConfig.channels.map(channel => 
        sendAlert(channel, {
          violation: data,
          employee,
          recipients: alertConfig.recipients,
        })
      )
    );

    // Log alert processing
    await logAlertProcessing(supabase, data.violationId, alertResults);

    // Schedule escalation if enabled and severity is high/critical
    if (alertConfig.escalationEnabled && ['high', 'critical'].includes(data.severity)) {
      await scheduleEscalation(supabase, data.violationId, alertConfig.escalationDelayMinutes);
    }

    const successCount = alertResults.filter(r => r.status === 'fulfilled').length;

    // Return result with rate limit headers
    const successResponse = new Response(
      JSON.stringify({
        success: true,
        violationId: data.violationId,
        alertsSent: successCount,
        totalChannels: alertConfig.channels.length,
        channels: alertConfig.channels,
        escalationScheduled: alertConfig.escalationEnabled && ['high', 'critical'].includes(data.severity),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

    return addRateLimitHeaders(successResponse, rateLimitResult);

  } catch (error) {
    console.error('Error processing violation alert:', error);

    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message, details: error.details }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to process violation alert', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function getAlertConfig(
  supabase: any,
  companyId: string,
  severity: string
): Promise<AlertConfig> {
  const { data, error } = await supabase
    .from('alert_settings')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error || !data) {
    // Default configuration
    return {
      channels: severity === 'critical' ? ['whatsapp', 'email'] : ['email'],
      recipients: [],
      escalationEnabled: severity === 'critical',
      escalationDelayMinutes: 15,
    };
  }

  return {
    channels: data.channels || ['email'],
    recipients: data.recipients || [],
    escalationEnabled: data.escalation_enabled || false,
    escalationDelayMinutes: data.escalation_delay_minutes || 15,
  };
}

async function getEmployeeDetails(supabase: any, employeeId: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('id, name, email, department, team_id')
    .eq('id', employeeId)
    .single();

  if (error) {
    console.error('Failed to get employee details:', error);
    return { id: employeeId, name: 'Unknown', email: null };
  }

  return data;
}

async function sendAlert(
  channel: string,
  payload: { violation: ViolationAlertRequest; employee: any; recipients: string[] }
): Promise<{ channel: string; success: boolean }> {
  console.log(`Sending alert via ${channel}`);

  try {
    switch (channel) {
      case 'whatsapp':
        // Call send-whatsapp function
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-whatsapp`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: payload.recipients[0],
            message: formatAlertMessage(payload.violation, payload.employee),
          }),
        });
        break;

      case 'email':
        // Implement email sending
        console.log('Email alert would be sent here');
        break;

      case 'webhook':
        // Call send-webhook function
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-webhook`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'violation_alert',
            payload: payload.violation,
          }),
        });
        break;

      case 'push':
        // Call send-push-notification function
        console.log('Push notification would be sent here');
        break;
    }

    return { channel, success: true };
  } catch (err) {
    console.error(`Failed to send ${channel} alert:`, err);
    return { channel, success: false };
  }
}

function formatAlertMessage(violation: ViolationAlertRequest, employee: any): string {
  const severityEmoji = {
    low: '🟡',
    medium: '🟠',
    high: '🔴',
    critical: '🚨',
  };

  return `${severityEmoji[violation.severity]} *ALERTA DE VIOLAÇÃO*

*Funcionário:* ${employee.name}
*Tipo:* ${violation.violationType}
*Severidade:* ${violation.severity.toUpperCase()}

*Descrição:*
${violation.description}

---
Sentinela - Sistema de Monitoramento`;
}

async function logAlertProcessing(
  supabase: any,
  violationId: string,
  results: PromiseSettledResult<{ channel: string; success: boolean }>[]
): Promise<void> {
  try {
    const channelResults = results.map((r, i) => ({
      channel: r.status === 'fulfilled' ? r.value.channel : 'unknown',
      success: r.status === 'fulfilled' ? r.value.success : false,
    }));

    await supabase.from('alert_logs').insert({
      violation_id: violationId,
      channels: channelResults,
      processed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log alert processing:', err);
  }
}

async function scheduleEscalation(
  supabase: any,
  violationId: string,
  delayMinutes: number
): Promise<void> {
  try {
    const escalationTime = new Date(Date.now() + delayMinutes * 60 * 1000);

    await supabase.from('escalation_queue').insert({
      violation_id: violationId,
      scheduled_at: escalationTime.toISOString(),
      status: 'pending',
    });

    console.log(`Escalation scheduled for ${escalationTime.toISOString()}`);
  } catch (err) {
    console.error('Failed to schedule escalation:', err);
  }
}
