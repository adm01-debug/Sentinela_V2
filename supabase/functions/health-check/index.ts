import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation Schema for optional query params
const HealthCheckQuerySchema = z.object({
  detailed: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  include_db: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  include_storage: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks?: {
    database?: { status: string; latency_ms?: number };
    storage?: { status: string; latency_ms?: number };
    functions?: { status: string };
  };
}

const startTime = Date.now();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'health-check', 60, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          status: 'rate_limited',
          retry_after: rateLimitResult.retryAfter 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate query params
    const url = new URL(req.url);
    const params = {
      detailed: url.searchParams.get('detailed') || undefined,
      include_db: url.searchParams.get('include_db') || undefined,
      include_storage: url.searchParams.get('include_storage') || undefined,
    };

    const validation = HealthCheckQuerySchema.safeParse(params);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid query parameters', details: validation.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { detailed, include_db, include_storage } = validation.data;

    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: Deno.env.get('FUNCTION_VERSION') || '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };

    // Detailed checks
    if (detailed || include_db || include_storage) {
      healthStatus.checks = {};

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Database check
        if (detailed || include_db) {
          const dbStart = Date.now();
          try {
            const { error } = await supabase.from('health_check').select('id').limit(1);
            healthStatus.checks.database = {
              status: error ? 'unhealthy' : 'healthy',
              latency_ms: Date.now() - dbStart,
            };
            if (error) healthStatus.status = 'degraded';
          } catch {
            healthStatus.checks.database = { status: 'unhealthy' };
            healthStatus.status = 'degraded';
          }
        }

        // Storage check
        if (detailed || include_storage) {
          const storageStart = Date.now();
          try {
            const { error } = await supabase.storage.from('screenshots').list('', { limit: 1 });
            healthStatus.checks.storage = {
              status: error ? 'unhealthy' : 'healthy',
              latency_ms: Date.now() - storageStart,
            };
            if (error) healthStatus.status = 'degraded';
          } catch {
            healthStatus.checks.storage = { status: 'unhealthy' };
            healthStatus.status = 'degraded';
          }
        }

        // Functions check
        if (detailed) {
          healthStatus.checks.functions = { status: 'healthy' };
        }
      }
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                       healthStatus.status === 'degraded' ? 200 : 503;

    return new Response(
      JSON.stringify(healthStatus),
      { 
        status: statusCode, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        } 
      }
    );

  } catch (error) {
    console.error('Health check error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        status: 'unhealthy', 
        error: message,
        timestamp: new Date().toISOString(),
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
