import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WebhookPayloadSchema = z.object({
  webhook_id: z.string().uuid(),
  event_type: z.string().min(1).max(100),
  payload: z.record(z.unknown()),
  retry_count: z.number().int().min(0).max(10).default(0),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'send-webhook', 30, 60);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validationResult = WebhookPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { webhook_id, event_type, payload, retry_count } = validationResult.data;
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Get webhook config from webhooks table
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhook_id)
      .single();

    if (webhookError || !webhook) {
      return new Response(
        JSON.stringify({ error: 'Webhook not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!webhook.is_active) {
      return new Response(
        JSON.stringify({ error: 'Webhook is inactive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!webhook.events?.includes(event_type)) {
      return new Response(
        JSON.stringify({ error: 'Event not subscribed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send webhook
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), (webhook.timeout_seconds || 30) * 1000);
    const startTime = Date.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event_type,
        'X-Webhook-Delivery': crypto.randomUUID(),
      };

      // HMAC signature
      if (webhook.secret) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(webhook.secret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(JSON.stringify(payload)));
        headers['X-Webhook-Signature'] = btoa(String.fromCharCode(...new Uint8Array(signature)));
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const durationMs = Date.now() - startTime;
      const responseBody = await response.text().catch(() => null);

      // Log to webhook_logs (real table)
      await supabase.from('webhook_logs').insert({
        webhook_id,
        event_type,
        payload,
        status: response.ok ? 'success' : 'failed',
        response_code: response.status,
        response_body: responseBody,
        attempt_number: retry_count + 1,
        duration_ms: durationMs,
        error_message: response.ok ? null : `HTTP ${response.status}`,
      });

      // Update webhook last status
      await supabase.from('webhooks').update({
        last_status: response.ok ? 'success' : 'failed',
        last_response_code: response.status,
        last_triggered_at: new Date().toISOString(),
      }).eq('id', webhook_id);

      if (!response.ok && retry_count < (webhook.retry_count || 3)) {
        return new Response(
          JSON.stringify({ success: false, retry: true, next_retry: retry_count + 1 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: response.ok, status: response.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      clearTimeout(timeout);
      const durationMs = Date.now() - startTime;
      const errMsg = fetchError instanceof Error ? fetchError.message : 'Fetch failed';

      // Log failure to webhook_logs
      await supabase.from('webhook_logs').insert({
        webhook_id,
        event_type,
        payload,
        status: 'error',
        attempt_number: retry_count + 1,
        duration_ms: durationMs,
        error_message: errMsg,
      });

      throw fetchError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
