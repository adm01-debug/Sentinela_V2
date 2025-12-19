import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimitConfig } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 50,
  windowMs: 60 * 1000,
  identifier: 'send-push-notification',
};

interface PushPayload {
  device_id?: string;
  employee_ids?: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  type?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, RATE_LIMIT_CONFIG);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PushPayload = await req.json();
    const { device_id, employee_ids, title, body: messageBody, data, type } = body;

    if (!title || !messageBody) {
      return new Response(
        JSON.stringify({ error: 'title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let query = supabase
      .from('mobile_devices')
      .select('push_token, employee_id')
      .eq('is_active', true)
      .not('push_token', 'is', null);

    if (device_id) {
      query = query.eq('id', device_id);
    } else if (employee_ids && employee_ids.length > 0) {
      query = query.in('employee_id', employee_ids);
    }

    const { data: devices, error: devicesError } = await query;
    if (devicesError) throw devicesError;

    if (!devices || devices.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No devices found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = await Promise.allSettled(
      devices.map(async (device) => {
        console.log('Sending push to', device.employee_id);
        await supabase.from('notifications').insert({
          type: type || 'push',
          title,
          message: messageBody,
          data,
          read: false,
        });
        return { success: true, employee_id: device.employee_id };
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;

    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: devices.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
