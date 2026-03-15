import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AnalyzeActivitySchema = z.object({
  employee_name: z.string().min(1),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  analysis_type: z.enum(['productivity', 'patterns', 'anomalies', 'summary', 'all']).default('summary'),
  include_apps: z.boolean().default(true),
  include_keystrokes: z.boolean().default(true),
  include_clicks: z.boolean().default(true),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'analyze-activity', 20, 60);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validation = AnalyzeActivitySchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { employee_name, date_from, date_to, analysis_type, include_apps, include_keystrokes, include_clicks } = validation.data;

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const now = new Date();
    const fromDate = date_from || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = date_to || now.toISOString();

    const analysis: Record<string, unknown> = {
      employee_name,
      period: { from: fromDate, to: toDate },
      generated_at: now.toISOString(),
    };

    // Productivity analysis from productivity_logs
    if (analysis_type === 'productivity' || analysis_type === 'summary' || analysis_type === 'all') {
      const { data: prodData } = await supabase
        .from('productivity_logs')
        .select('*')
        .eq('employee_name', employee_name)
        .gte('recorded_date', fromDate)
        .lte('recorded_date', toDate);

      const totalProductive = prodData?.reduce((s, r) => s + (r.productive_time_seconds || 0), 0) || 0;
      const totalUnproductive = prodData?.reduce((s, r) => s + (r.unproductive_time_seconds || 0), 0) || 0;
      const totalNeutral = prodData?.reduce((s, r) => s + (r.neutral_time_seconds || 0), 0) || 0;
      const totalTime = totalProductive + totalUnproductive + totalNeutral;

      analysis.productivity = {
        productive_seconds: totalProductive,
        unproductive_seconds: totalUnproductive,
        neutral_seconds: totalNeutral,
        total_seconds: totalTime,
        score: totalTime > 0 ? Math.round((totalProductive / totalTime) * 100) : 0,
        records_count: prodData?.length || 0,
      };
    }

    // Keystroke analysis from keystroke_logs
    if (include_keystrokes && (analysis_type === 'summary' || analysis_type === 'all')) {
      const { data: keyData } = await supabase
        .from('keystroke_logs')
        .select('*')
        .eq('employee_name', employee_name)
        .gte('recorded_at', fromDate)
        .lte('recorded_at', toDate);

      analysis.keystrokes = {
        total_keystrokes: keyData?.reduce((s, r) => s + (r.keystrokes_count || 0), 0) || 0,
        total_active_seconds: keyData?.reduce((s, r) => s + (r.active_time_seconds || 0), 0) || 0,
        total_idle_seconds: keyData?.reduce((s, r) => s + (r.idle_time_seconds || 0), 0) || 0,
        records_count: keyData?.length || 0,
      };
    }

    // Click analysis from click_logs
    if (include_clicks && (analysis_type === 'summary' || analysis_type === 'all')) {
      const { data: clickData } = await supabase
        .from('click_logs')
        .select('*')
        .eq('employee_name', employee_name)
        .gte('recorded_at', fromDate)
        .lte('recorded_at', toDate);

      const appClicks = new Map<string, number>();
      for (const click of clickData || []) {
        if (click.app_name) {
          appClicks.set(click.app_name, (appClicks.get(click.app_name) || 0) + 1);
        }
      }

      analysis.clicks = {
        total_clicks: clickData?.length || 0,
        top_apps: Array.from(appClicks.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
      };
    }

    // App usage from productivity_logs.apps_used
    if (include_apps && (analysis_type === 'summary' || analysis_type === 'all')) {
      const { data: prodData } = await supabase
        .from('productivity_logs')
        .select('apps_used')
        .eq('employee_name', employee_name)
        .gte('recorded_date', fromDate)
        .lte('recorded_date', toDate);

      const appUsage = new Map<string, number>();
      for (const log of prodData || []) {
        if (log.apps_used && typeof log.apps_used === 'object') {
          for (const [app, secs] of Object.entries(log.apps_used as Record<string, number>)) {
            appUsage.set(app, (appUsage.get(app) || 0) + (secs || 0));
          }
        }
      }

      analysis.applications = {
        top_apps: Array.from(appUsage.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, seconds]) => ({ name, seconds, hours: Math.round(seconds / 360) / 10 })),
      };
    }

    // Anomaly detection
    if (analysis_type === 'anomalies' || analysis_type === 'all') {
      const anomalies: string[] = [];
      if (analysis.productivity) {
        const prod = analysis.productivity as any;
        if (prod.score < 30) anomalies.push('Very low productivity score');
        if (prod.unproductive_seconds > prod.productive_seconds * 2) anomalies.push('Excessive unproductive time');
      }
      if (analysis.keystrokes) {
        const keys = analysis.keystrokes as any;
        if (keys.total_idle_seconds > keys.total_active_seconds * 2) anomalies.push('Excessive idle time');
      }
      analysis.anomalies = anomalies;
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
