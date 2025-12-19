import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: CheckResult;
    storage: CheckResult;
    auth: CheckResult;
    edge_functions: CheckResult;
  };
  response_time_ms: number;
}

interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  latency_ms?: number;
}

async function checkDatabase(supabase: any): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id')
      .limit(1);
    
    const latency = Date.now() - start;
    
    if (error) {
      return {
        status: 'fail',
        message: `Database error: ${error.message}`,
        latency_ms: latency,
      };
    }
    
    if (latency > 1000) {
      return {
        status: 'warn',
        message: 'Database responding slowly',
        latency_ms: latency,
      };
    }
    
    return {
      status: 'pass',
      message: 'Database connection healthy',
      latency_ms: latency,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: `Database check failed: ${error.message}`,
      latency_ms: Date.now() - start,
    };
  }
}

async function checkStorage(supabase: any): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    const latency = Date.now() - start;
    
    if (error) {
      return {
        status: 'fail',
        message: `Storage error: ${error.message}`,
        latency_ms: latency,
      };
    }
    
    return {
      status: 'pass',
      message: `Storage healthy (${data?.length || 0} buckets)`,
      latency_ms: latency,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: `Storage check failed: ${error.message}`,
      latency_ms: Date.now() - start,
    };
  }
}

async function checkAuth(supabase: any): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Just check if auth service responds
    const { data, error } = await supabase.auth.getSession();
    
    const latency = Date.now() - start;
    
    // No session is expected, but no error means auth is working
    if (error && !error.message.includes('session')) {
      return {
        status: 'fail',
        message: `Auth error: ${error.message}`,
        latency_ms: latency,
      };
    }
    
    return {
      status: 'pass',
      message: 'Auth service healthy',
      latency_ms: latency,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: `Auth check failed: ${error.message}`,
      latency_ms: Date.now() - start,
    };
  }
}

function checkEdgeFunctions(): CheckResult {
  // If this function is running, Edge Functions are working
  return {
    status: 'pass',
    message: 'Edge Functions operational',
    latency_ms: 0,
  };
}

function determineOverallStatus(checks: HealthStatus['checks']): 'healthy' | 'degraded' | 'unhealthy' {
  const results = Object.values(checks);
  
  if (results.some(r => r.status === 'fail')) {
    return 'unhealthy';
  }
  
  if (results.some(r => r.status === 'warn')) {
    return 'degraded';
  }
  
  return 'healthy';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Run all health checks in parallel
    const [database, storage, auth] = await Promise.all([
      checkDatabase(supabase),
      checkStorage(supabase),
      checkAuth(supabase),
    ]);

    const checks = {
      database,
      storage,
      auth,
      edge_functions: checkEdgeFunctions(),
    };

    const healthStatus: HealthStatus = {
      status: determineOverallStatus(checks),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks,
      response_time_ms: Date.now() - startTime,
    };

    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                       healthStatus.status === 'degraded' ? 200 : 503;

    return new Response(
      JSON.stringify(healthStatus, null, 2),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    const errorResponse: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        database: { status: 'fail', message: 'Check failed' },
        storage: { status: 'fail', message: 'Check failed' },
        auth: { status: 'fail', message: 'Check failed' },
        edge_functions: { status: 'fail', message: error.message },
      },
      response_time_ms: Date.now() - startTime,
    };

    return new Response(
      JSON.stringify(errorResponse, null, 2),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
