import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Get user's company to validate license/plan
    const { data: companyId } = await supabase.rpc('get_user_company_id', { p_user_id: user.id });
    
    if (!companyId) {
      return new Response(JSON.stringify({ valid: false, error: 'No company associated' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: company } = await supabase.from('companies')
      .select('id, name, plan, is_active, max_employees, slug')
      .eq('id', companyId)
      .maybeSingle();

    if (!company) {
      return new Response(JSON.stringify({ valid: false, error: 'Company not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!company.is_active) {
      return new Response(JSON.stringify({ valid: false, error: 'Company inactive', plan: company.plan }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Count current employees
    const { count: currentEmployees } = await supabase.from('employees')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId);

    return new Response(JSON.stringify({ 
      valid: true, 
      plan: company.plan ?? 'free',
      companyName: company.name,
      maxEmployees: company.max_employees,
      currentEmployees: currentEmployees ?? 0,
      isAtLimit: company.max_employees ? (currentEmployees ?? 0) >= company.max_employees : false,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
