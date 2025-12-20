import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HealthQuerySchema = z.object({
  format: z.enum(['json', 'text']).default('json'),
});

const startTime = Date.now();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'health', 100, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ status: 'rate_limited' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const params = {
      format: url.searchParams.get('format') || 'json',
    };

    const validation = HealthQuerySchema.safeParse(params);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { format } = validation.data;
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    if (format === 'text') {
      return new Response(
        `OK - uptime: ${uptime}s`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: Deno.env.get('FUNCTION_VERSION') || '1.0.0',
        uptime_seconds: uptime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ status: 'unhealthy', error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
