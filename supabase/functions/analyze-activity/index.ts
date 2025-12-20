import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation Schemas
const AnalyzeActivitySchema = z.object({
  employee_id: z.string().uuid(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  analysis_type: z.enum([
    'productivity',
    'patterns',
    'anomalies',
    'summary',
    'comparison',
    'all',
  ]).default('summary'),
  include_apps: z.boolean().default(true),
  include_urls: z.boolean().default(true),
  include_idle: z.boolean().default(true),
  comparison_period: z.enum(['day', 'week', 'month']).optional(),
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

    const { 
      employee_id, 
      date_from, 
      date_to, 
      analysis_type,
      include_apps,
      include_urls,
      include_idle,
    } = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const fromDate = date_from || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = date_to || now.toISOString();

    const analysis: Record<string, unknown> = {
      employee_id,
      period: { from: fromDate, to: toDate },
      generated_at: now.toISOString(),
    };

    // Productivity analysis
    if (analysis_type === 'productivity' || analysis_type === 'summary' || analysis_type === 'all') {
      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('employee_id', employee_id)
        .gte('recorded_at', fromDate)
        .lte('recorded_at', toDate);

      const totalKeystrokes = activityData?.reduce((sum, a) => sum + (a.keystrokes || 0), 0) || 0;
      const totalClicks = activityData?.reduce((sum, a) => sum + (a.mouse_clicks || 0), 0) || 0;
      const totalIdleTime = activityData?.reduce((sum, a) => sum + (a.idle_time || 0), 0) || 0;
      const totalActiveTime = (activityData?.length || 0) * 60 - totalIdleTime; // Assuming 1 min intervals

      analysis.productivity = {
        total_keystrokes: totalKeystrokes,
        total_clicks: totalClicks,
        total_idle_seconds: totalIdleTime,
        total_active_seconds: Math.max(0, totalActiveTime),
        activity_score: totalActiveTime > 0 
          ? Math.round((totalActiveTime / ((activityData?.length || 1) * 60)) * 100)
          : 0,
        records_count: activityData?.length || 0,
      };
    }

    // Application usage analysis
    if (include_apps && (analysis_type === 'summary' || analysis_type === 'all')) {
      const { data: appData } = await supabase
        .from('application_usage')
        .select('*')
        .eq('employee_id', employee_id)
        .gte('start_time', fromDate)
        .lte('start_time', toDate);

      const appUsage = new Map<string, number>();
      const productiveTime = { productive: 0, unproductive: 0, neutral: 0 };

      for (const app of appData || []) {
        const duration = app.duration_seconds || 0;
        appUsage.set(app.app_name, (appUsage.get(app.app_name) || 0) + duration);
        
        if (app.is_productive === true) productiveTime.productive += duration;
        else if (app.is_productive === false) productiveTime.unproductive += duration;
        else productiveTime.neutral += duration;
      }

      const topApps = Array.from(appUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, seconds]) => ({ name, seconds, hours: Math.round(seconds / 360) / 10 }));

      analysis.applications = {
        top_apps: topApps,
        productive_seconds: productiveTime.productive,
        unproductive_seconds: productiveTime.unproductive,
        neutral_seconds: productiveTime.neutral,
        productivity_ratio: productiveTime.productive + productiveTime.unproductive > 0
          ? Math.round((productiveTime.productive / (productiveTime.productive + productiveTime.unproductive)) * 100)
          : 50,
      };
    }

    // URL analysis
    if (include_urls && (analysis_type === 'summary' || analysis_type === 'all')) {
      const { data: urlData } = await supabase
        .from('url_visits')
        .select('*')
        .eq('employee_id', employee_id)
        .gte('visit_time', fromDate)
        .lte('visit_time', toDate);

      const domains = new Map<string, number>();
      for (const url of urlData || []) {
        try {
          const domain = new URL(url.url).hostname;
          domains.set(domain, (domains.get(domain) || 0) + (url.duration_seconds || 1));
        } catch {}
      }

      const topDomains = Array.from(domains.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([domain, seconds]) => ({ domain, seconds }));

      analysis.urls = {
        total_visits: urlData?.length || 0,
        top_domains: topDomains,
      };
    }

    // Anomaly detection
    if (analysis_type === 'anomalies' || analysis_type === 'all') {
      const anomalies: string[] = [];
      
      if (analysis.productivity) {
        const prod = analysis.productivity as any;
        if (prod.activity_score < 30) anomalies.push('Very low activity score');
        if (prod.total_idle_seconds > prod.total_active_seconds * 2) anomalies.push('Excessive idle time');
      }
      
      if (analysis.applications) {
        const apps = analysis.applications as any;
        if (apps.productivity_ratio < 30) anomalies.push('Low productivity ratio');
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
