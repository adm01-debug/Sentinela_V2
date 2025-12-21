import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { resource, format = 'json', filters = {} } = await req.json();

    let query = supabase.from(resource).select('*');
    
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value as string);
    }

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
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
