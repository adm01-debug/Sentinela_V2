import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimitConfig } from '../_shared/rateLimiting.ts';
import { 
  analyzeActivitySchema, 
  validateInput, 
  createValidationErrorResponse 
} from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60 * 1000,
  identifier: 'analyze-activity',
};

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

    const body = await req.json();
    const validation = validateInput(analyzeActivitySchema, body);
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.error, validation.details, corsHeaders);
    }

    const { employee_id, period, start_date, end_date } = validation.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Calculate date range
    let since: string;
    let until = end_date || new Date().toISOString();
    
    if (start_date) {
      since = start_date;
    } else {
      const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;
      since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
    }

    // Get activity data
    const { data: activities, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('employee_id', employee_id)
      .gte('created_at', since)
      .lte('created_at', until)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate metrics
    const totalDuration = activities?.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) || 0;
    const activeTime = activities?.filter(a => a.activity_type === 'active')
      .reduce((sum, a) => sum + (a.duration_seconds || 0), 0) || 0;
    const idleTime = totalDuration - activeTime;
    
    const keystrokes = activities?.reduce((sum, a) => sum + (a.keystroke_count || 0), 0) || 0;
    const mouseClicks = activities?.reduce((sum, a) => sum + (a.mouse_clicks || 0), 0) || 0;

    // Get applications used
    const applications = [...new Set(activities?.map(a => a.application_name).filter(Boolean))];

    // Calculate productivity score
    const productivityScore = totalDuration > 0 
      ? Math.round((activeTime / totalDuration) * 100) 
      : 0;

    return new Response(
      JSON.stringify({ 
        success: true,
        employee_id,
        period: { start: since, end: until },
        metrics: {
          total_hours: Math.round(totalDuration / 3600 * 10) / 10,
          active_hours: Math.round(activeTime / 3600 * 10) / 10,
          idle_hours: Math.round(idleTime / 3600 * 10) / 10,
          productivity_score: productivityScore,
          keystrokes,
          mouse_clicks: mouseClicks,
          applications_count: applications.length,
        },
        applications,
        activity_count: activities?.length || 0,
      }),
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
