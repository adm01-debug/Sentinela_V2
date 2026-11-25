import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';
import { callerClient, callerCompanyId, companyScope, withCompanyScope } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ScheduledReportSchema = z.object({
  report_id: z.string().uuid(),
  manual: z.boolean().default(false),
  force: z.boolean().default(false),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller — reject unauthenticated requests
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT and retrieve the authenticated user
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'send-report', 5, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validationResult = ScheduledReportSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { report_id, manual, force } = validationResult.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // `scheduled_reports` tem RLS exclusiva de admin e a tela tem AdminGuard;
    // sem esta checagem qualquer usuario logado disparava o envio de qualquer
    // relatorio e recebia os dados de todas as empresas por e-mail.
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin'])
      .limit(1);

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Escopo oficial do tenant (mesma fonte das policies).
    const callerCompany = await callerCompanyId(supabase, {
      user: { id: user.id },
      isServiceRole: false,
    });
    const scope = companyScope(callerCompany);
    // productivity_metrics nao tem company_id; a policy escopa via employees,
    // entao essa leitura fala como o chamador (RLS vale).
    const dataClient = callerClient(req);

    // Get report configuration
    const { data: report, error: reportError } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('id', report_id)
      .single();

    if (reportError || !report) {
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // `scheduled_reports` nao tem company_id: o vinculo de tenant e o autor.
    // Sem isto um admin da empresa A disparava o relatorio agendado da B.
    if (report.created_by && report.created_by !== user.id) {
      const creatorCompany = await callerCompanyId(supabase, {
        user: { id: report.created_by },
        isServiceRole: false,
      });
      if (!creatorCompany || creatorCompany !== callerCompany) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: report from another company' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!report.is_active && !force) {
      return new Response(
        JSON.stringify({ error: 'Report is inactive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate report data based on type
    let reportData;
    switch (report.report_type) {
      case 'violations': {
        const { data: violations } = await withCompanyScope(
          supabase
            .from('security_violations')
            .select('*')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
          scope
        );
        reportData = violations;
        break;
      }
      case 'productivity': {
        const { data: productivity } = await dataClient
          .from('productivity_metrics')
          .select('*')
          .gte('date', new Date().toISOString().split('T')[0]);
        reportData = productivity;
        break;
      }
      default:
        reportData = { message: 'Report generated' };
    }

    // Log the report execution
    await supabase.from('report_logs').insert({
      report_id,
      executed_at: new Date().toISOString(),
      manual,
      status: 'success',
      records_count: Array.isArray(reportData) ? reportData.length : 1,
    });

    // Update last_run
    await supabase
      .from('scheduled_reports')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', report_id);

    return new Response(
      JSON.stringify({ success: true, data: reportData }),
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
