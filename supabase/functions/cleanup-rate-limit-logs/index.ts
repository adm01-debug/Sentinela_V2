import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CleanupSchema = z.object({
  days_to_keep: z.number().int().min(1).max(365).default(30),
  dry_run: z.boolean().default(false),
  tables: z.array(z.enum(['rate_limit_logs', 'rate_limit_alerts', 'webhook_deliveries', 'activity_logs'])).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'cleanup', 5, 3600);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      // Use defaults
    }

    const validationResult = CleanupSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { days_to_keep, dry_run, tables } = validationResult.data;
    const cutoffDate = new Date(Date.now() - days_to_keep * 24 * 60 * 60 * 1000).toISOString();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tablesToClean = tables || ['rate_limit_logs', 'rate_limit_alerts'];
    const results: Record<string, number> = {};

    for (const table of tablesToClean) {
      const dateColumn = table === 'webhook_deliveries' ? 'delivered_at' : 'created_at';
      
      if (dry_run) {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .lt(dateColumn, cutoffDate);
        results[table] = count || 0;
      } else {
        const { count } = await supabase
          .from(table)
          .delete()
          .lt(dateColumn, cutoffDate)
          .select('*', { count: 'exact', head: true });
        results[table] = count || 0;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dry_run,
        cutoff_date: cutoffDate,
        deleted: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
