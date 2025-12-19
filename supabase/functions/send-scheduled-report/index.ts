import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimitConfig } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 20,
  windowMs: 60 * 1000,
  identifier: 'send-scheduled-report',
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

    const { report_id, manual } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get report config
    const { data: report, error: reportError } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('id', report_id)
      .single();

    if (reportError || !report) {
      throw new Error('Report not found');
    }

    if (!report.is_active && !manual) {
      throw new Error('Report is not active');
    }

    // Generate report data based on type
    let reportData: Record<string, unknown> = {};
    
    switch (report.report_type) {
      case 'productivity':
        const { data: employees } = await supabase
          .from('employees')
          .select('id, full_name, department')
          .eq('status', 'active');
        reportData = { employees, generated_at: new Date().toISOString() };
        break;
      case 'violations':
        const { data: violations } = await supabase
          .from('security_violations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        reportData = { violations, generated_at: new Date().toISOString() };
        break;
      default:
        reportData = { type: report.report_type, generated_at: new Date().toISOString() };
    }

    // Update last_run_at
    await supabase
      .from('scheduled_reports')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', report_id);

    // TODO: Send email to recipients with report

    return new Response(
      JSON.stringify({ 
        success: true,
        report_id,
        report_type: report.report_type,
        recipients: report.recipients,
        data: reportData,
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
