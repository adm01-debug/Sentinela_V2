import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RateLimitAlertSchema = z.object({
  ip: z.string().min(1),
  endpoint: z.string().min(1),
  count: z.number().int().positive(),
  threshold: z.number().int().positive(),
  window_seconds: z.number().int().positive().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'rate-limit-alert', 10, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validationResult = RateLimitAlertSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { ip, endpoint, count, threshold, window_seconds } = validationResult.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log the alert
    await supabase.from('rate_limit_alerts').insert({
      ip,
      endpoint,
      request_count: count,
      threshold,
      window_seconds: window_seconds || 60,
      alerted_at: new Date().toISOString(),
    });

    // Check if IP should be blocked
    const { data: recentAlerts } = await supabase
      .from('rate_limit_alerts')
      .select('*')
      .eq('ip', ip)
      .gte('alerted_at', new Date(Date.now() - 3600000).toISOString());

    if (recentAlerts && recentAlerts.length >= 5) {
      // Auto-block IP
      await supabase.from('blocked_ips').upsert({
        ip,
        reason: 'Automatic block due to repeated rate limit violations',
        blocked_at: new Date().toISOString(),
        blocked_until: new Date(Date.now() + 24 * 3600000).toISOString(),
      }, { onConflict: 'ip' });
    }

    return new Response(
      JSON.stringify({ success: true, alerts_count: recentAlerts?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
