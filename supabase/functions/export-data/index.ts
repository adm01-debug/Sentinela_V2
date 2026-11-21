import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Whitelist explicita: a edge usa service_role, entao o recurso nunca vem livre do request.
const ALLOWED_RESOURCES = new Set([
  'employees',
  'activities',
  'violations',
  'devices',
  'keystroke_logs',
  'click_logs',
]);

const COMPANY_SCOPED = new Set(['violations', 'devices', 'keystroke_logs', 'click_logs']);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userRes = await fetch(`${Deno.env.get('SUPABASE_URL') ?? ''}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      },
    });
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const user = await userRes.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    // Contrato do front (DataExportPage): type/format/date_from/date_to
    const resource = body.type ?? body.resource;
    const format = body.format ?? 'json';
    const dateFrom = body.date_from;
    const dateTo = body.date_to;
    const filters = body.filters ?? {};

    if (typeof resource !== 'string' || !ALLOWED_RESOURCES.has(resource)) {
      return new Response(
        JSON.stringify({
          error: `Recurso invalido. Permitidos: ${[...ALLOWED_RESOURCES].join(', ')}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: membership } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let query = supabase.from(resource).select('*');

    if (COMPANY_SCOPED.has(resource) && membership?.company_id) {
      query = query.eq('company_id', membership.company_id);
    }

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value as string);
    }
    if (dateFrom) query = query.gte('created_at', dateFrom as string);
    if (dateTo) query = query.lte('created_at', dateTo as string);

    const { data, error } = await query;
    if (error) throw error;

    let content: string;
    let contentType: string;

    if (format === 'csv') {
      const headers = data && data.length > 0 ? Object.keys(data[0]).join(',') : '';
      const rows = data?.map(row => Object.values(row).join(',')) || [];
      content = [headers, ...rows].join('\n');
      contentType = 'text/csv';
    } else {
      content = JSON.stringify(data, null, 2);
      contentType = 'application/json';
    }

    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${resource}_export.${format}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
