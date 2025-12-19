import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event_type: string;
  data: Record<string, any>;
  timestamp: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  headers: Record<string, string>;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
}

function generateSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

async function sendWebhookRequest(
  webhook: Webhook,
  payload: WebhookPayload,
  attempt: number = 1
): Promise<{ success: boolean; statusCode?: number; responseBody?: string; error?: string; durationMs: number }> {
  const startTime = Date.now();
  const payloadString = JSON.stringify(payload);
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': payload.event_type,
      'X-Webhook-Timestamp': payload.timestamp,
      'X-Webhook-Attempt': attempt.toString(),
      ...(webhook.headers || {}),
    };

    if (webhook.secret) {
      headers['X-Webhook-Signature'] = generateSignature(payloadString, webhook.secret);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseBody = await response.text();
    const durationMs = Date.now() - startTime;

    return {
      success: response.ok,
      statusCode: response.status,
      responseBody: responseBody.substring(0, 1000), // Limit response body size
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs,
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event_type, data, webhook_id, test_mode } = await req.json();

    if (!event_type) {
      return new Response(
        JSON.stringify({ error: 'event_type is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: WebhookPayload = {
      event_type,
      data: data || {},
      timestamp: new Date().toISOString(),
    };

    console.log(`Processing webhook event: ${event_type}`, { test_mode, webhook_id });

    // Fetch active webhooks that listen to this event
    let query = supabase
      .from('webhooks')
      .select('*')
      .eq('is_active', true)
      .contains('events', [event_type]);

    // If webhook_id is specified (for testing), only send to that webhook
    if (webhook_id) {
      query = supabase
        .from('webhooks')
        .select('*')
        .eq('id', webhook_id);
    }

    const { data: webhooks, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching webhooks:', fetchError);
      throw fetchError;
    }

    if (!webhooks || webhooks.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No active webhooks for this event', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${webhooks.length} webhooks to notify`);

    const results = [];

    for (const webhook of webhooks as Webhook[]) {
      let lastResult = null;
      let success = false;

      // Retry logic
      for (let attempt = 1; attempt <= webhook.retry_count; attempt++) {
        console.log(`Sending to webhook ${webhook.name} (attempt ${attempt}/${webhook.retry_count})`);
        
        lastResult = await sendWebhookRequest(webhook, payload, attempt);

        // Log the attempt
        const logEntry = {
          webhook_id: webhook.id,
          event_type,
          payload,
          response_code: lastResult.statusCode,
          response_body: lastResult.responseBody,
          error_message: lastResult.error,
          duration_ms: lastResult.durationMs,
          attempt_number: attempt,
          status: lastResult.success ? 'success' : (attempt === webhook.retry_count ? 'failed' : 'retrying'),
        };

        // Only log if not in test mode or if it's the final attempt
        if (!test_mode || attempt === webhook.retry_count) {
          await supabase.from('webhook_logs').insert(logEntry);
        }

        if (lastResult.success) {
          success = true;
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < webhook.retry_count) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }

      // Update webhook status
      await supabase
        .from('webhooks')
        .update({
          last_triggered_at: new Date().toISOString(),
          last_status: success ? 'success' : 'failed',
          last_response_code: lastResult?.statusCode,
        })
        .eq('id', webhook.id);

      results.push({
        webhook_id: webhook.id,
        webhook_name: webhook.name,
        success,
        statusCode: lastResult?.statusCode,
        error: lastResult?.error,
        durationMs: lastResult?.durationMs,
      });
    }

    const successCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent to ${successCount}/${results.length} webhooks`,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
