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

    const { employees } = await req.json();

    if (!Array.isArray(employees)) {
      throw new Error('employees must be an array');
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const employee of employees) {
      const { error } = await supabase.from('employees').upsert({
        email: employee.email,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        team_id: employee.teamId,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      if (error) {
        results.failed++;
        results.errors.push(`${employee.email}: ${error.message}`);
      } else {
        results.success++;
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
