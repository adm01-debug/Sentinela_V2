import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PushNotificationSchema = z.object({
  device_tokens: z.array(z.string().min(1)).min(1).max(100),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
  priority: z.enum(['high', 'normal']).default('normal'),
  badge: z.number().int().min(0).optional(),
  sound: z.string().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'send-push', 30, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validationResult = PushNotificationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { device_tokens, title, body: messageBody, data, priority, badge, sound } = validationResult.data;

    // Send to FCM (Firebase Cloud Messaging)
    const fcmKey = Deno.env.get('FCM_SERVER_KEY');
    if (!fcmKey) {
      throw new Error('FCM_SERVER_KEY not configured');
    }

    const results = await Promise.allSettled(
      device_tokens.map(async (token) => {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${fcmKey}`,
          },
          body: JSON.stringify({
            to: token,
            notification: { title, body: messageBody, badge, sound },
            data,
            priority,
          }),
        });
        return response.json();
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({ success: true, sent: successful, failed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
