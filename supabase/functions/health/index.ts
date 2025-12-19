// ============================================================
// HEALTH CHECK EDGE FUNCTION
// Returns system health status and metrics
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// ============================================================
// CORS HEADERS
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// TYPES
// ============================================================

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: CheckResult;
    storage: CheckResult;
    auth: CheckResult;
  };
  metrics?: {
    responseTime: number;
    memoryUsage?: number;
  };
}

interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  latency: number;
  message?: string;
}

// ============================================================
// START TIME (for uptime calculation)
// ============================================================

const startTime = Date.now();

// ============================================================
// HEALTH CHECKS
// ============================================================

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true });

    const latency = Date.now() - start;

    if (error) {
      return {
        status: 'fail',
        latency,
        message: error.message,
      };
    }

    return {
      status: latency > 1000 ? 'warn' : 'pass',
      latency,
      message: latency > 1000 ? 'High latency detected' : undefined,
    };
  } catch (err) {
    return {
      status: 'fail',
      latency: Date.now() - start,
      message: err.message,
    };
  }
}

async function checkStorage(): Promise<CheckResult> {
  const start = Date.now();
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase.storage.listBuckets();
    const latency = Date.now() - start;

    if (error) {
      return {
        status: 'fail',
        latency,
        message: error.message,
      };
    }

    return {
      status: latency > 500 ? 'warn' : 'pass',
      latency,
    };
  } catch (err) {
    return {
      status: 'fail',
      latency: Date.now() - start,
      message: err.message,
    };
  }
}

async function checkAuth(): Promise<CheckResult> {
  const start = Date.now();
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Simple auth check - just verify we can connect
    const { error } = await supabase.auth.getSession();
    const latency = Date.now() - start;

    // No session is expected for service role
    return {
      status: latency > 500 ? 'warn' : 'pass',
      latency,
    };
  } catch (err) {
    return {
      status: 'fail',
      latency: Date.now() - start,
      message: err.message,
    };
  }
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestStart = Date.now();

  try {
    // Run all health checks in parallel
    const [database, storage, auth] = await Promise.all([
      checkDatabase(),
      checkStorage(),
      checkAuth(),
    ]);

    // Determine overall status
    const checks = { database, storage, auth };
    const hasFailure = Object.values(checks).some(c => c.status === 'fail');
    const hasWarning = Object.values(checks).some(c => c.status === 'warn');

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (hasFailure) {
      status = 'unhealthy';
    } else if (hasWarning) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      version: Deno.env.get('APP_VERSION') || '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      checks,
      metrics: {
        responseTime: Date.now() - requestStart,
      },
    };

    // Return appropriate status code
    const httpStatus = status === 'unhealthy' ? 503 : status === 'degraded' ? 200 : 200;

    return new Response(JSON.stringify(healthStatus, null, 2), {
      status: httpStatus,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);

    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
