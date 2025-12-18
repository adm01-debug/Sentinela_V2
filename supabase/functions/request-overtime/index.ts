import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employee_name, agent_key, reason, hours_requested } = await req.json();

    if (!employee_name || !agent_key) {
      return new Response(
        JSON.stringify({ error: 'Missing employee_name or agent_key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify agent key
    const { data: agentKey, error: keyError } = await supabase
      .from('agent_keys')
      .select('*')
      .eq('agent_key', agent_key)
      .eq('is_active', true)
      .single();

    if (keyError || !agentKey) {
      console.log('Invalid agent key:', agent_key);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive agent key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find employee by name
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, name')
      .eq('name', employee_name)
      .single();

    if (empError || !employee) {
      console.log('Employee not found:', employee_name);
      return new Response(
        JSON.stringify({ error: 'Employee not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate overtime period (from now + hours requested)
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    // Calculate end time based on hours requested (default 2 hours)
    const hoursToAdd = hours_requested || 2;
    const endHour = Math.min(currentHour + hoursToAdd, 23);
    const endTime = `${String(endHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    // Check if there's already a pending request for today
    const { data: existingRequest } = await supabase
      .from('overtime_requests')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('requested_date', today)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      console.log('Existing pending request found for:', employee_name);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Already have a pending overtime request for today',
          request_id: existingRequest.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create overtime request
    const { data: overtimeRequest, error: insertError } = await supabase
      .from('overtime_requests')
      .insert({
        employee_id: employee.id,
        requested_date: today,
        start_time: startTime,
        end_time: endTime,
        reason: reason || 'Solicitado via tela de bloqueio',
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating overtime request:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create overtime request', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Overtime request created for ${employee_name}: ${startTime} - ${endTime}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Overtime request submitted successfully',
        request: {
          id: overtimeRequest.id,
          requested_date: today,
          start_time: startTime,
          end_time: endTime,
          status: 'pending'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in request-overtime:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message, success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
