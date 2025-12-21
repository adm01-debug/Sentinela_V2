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

    const { employeeId, source = 'manual' } = await req.json();

    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (fetchError) throw fetchError;

    const syncData = {
      employee_id: employeeId,
      source,
      synced_at: new Date().toISOString(),
      status: 'success',
      data: employee,
    };

    const { error: logError } = await supabase
      .from('sync_logs')
      .insert(syncData);

    if (logError) console.error('Sync log error:', logError);

    const { error: updateError } = await supabase
      .from('employees')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', employeeId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, employee, syncedAt: syncData.synced_at }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
