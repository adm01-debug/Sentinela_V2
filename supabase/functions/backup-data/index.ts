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

    const { tables = ['employees', 'violations', 'activity_logs'] } = await req.json();
    const backup: Record<string, unknown[]> = {};

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      backup[table] = data || [];
    }

    const backupData = JSON.stringify(backup);
    const fileName = `backup_${new Date().toISOString().split('T')[0]}.json`;

    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(fileName, backupData, { contentType: 'application/json' });

    if (uploadError) throw uploadError;

    return new Response(
      JSON.stringify({ success: true, fileName, tables: Object.keys(backup) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
