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
    const { employee_name, agent_key } = await req.json();

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
      .select('id, name, status')
      .eq('name', employee_name)
      .single();

    if (empError || !employee) {
      console.log('Employee not found:', employee_name);
      return new Response(
        JSON.stringify({ 
          schedule: null, 
          block_station: false,
          reason: 'Employee not found in system'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get employee's current schedule
    const today = new Date().toISOString().split('T')[0];
    const { data: employeeSchedule, error: schedError } = await supabase
      .from('employee_schedules')
      .select(`
        *,
        schedule:work_schedules(*)
      `)
      .eq('employee_id', employee.id)
      .lte('effective_from', today)
      .or(`effective_until.is.null,effective_until.gte.${today}`)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single();

    if (schedError || !employeeSchedule || !employeeSchedule.schedule) {
      console.log('No schedule found for employee:', employee_name);
      return new Response(
        JSON.stringify({ 
          schedule: null, 
          block_station: false,
          reason: 'No schedule assigned'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const schedule = employeeSchedule.schedule;
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    // Check if today is a work day
    const isWorkDay = schedule.work_days.includes(currentDay);

    // Parse schedule times
    const parseTime = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startTime = parseTime(schedule.start_time);
    const endTime = parseTime(schedule.end_time);
    const gracePeriod = schedule.grace_period_minutes || 5;

    // Check lunch break
    let isLunchBreak = false;
    if (schedule.lunch_start && schedule.lunch_end) {
      const lunchStart = parseTime(schedule.lunch_start);
      const lunchEnd = parseTime(schedule.lunch_end);
      isLunchBreak = currentTimeMinutes >= lunchStart && currentTimeMinutes < lunchEnd;
    }

    // Determine if station should be blocked
    let shouldBlock = false;
    let blockReason = '';

    if (!isWorkDay) {
      shouldBlock = true;
      blockReason = 'Fora do dia de trabalho configurado';
    } else if (currentTimeMinutes < (startTime - gracePeriod)) {
      shouldBlock = true;
      blockReason = `Antes do horário de início (${schedule.start_time})`;
    } else if (currentTimeMinutes > (endTime + gracePeriod)) {
      shouldBlock = true;
      blockReason = `Após o horário de término (${schedule.end_time})`;
    }

    // Check for approved overtime if blocking
    if (shouldBlock && schedule.allow_overtime) {
      const { data: overtime } = await supabase
        .from('overtime_requests')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('requested_date', today)
        .eq('status', 'approved')
        .single();

      if (overtime) {
        const overtimeStart = parseTime(overtime.start_time);
        const overtimeEnd = parseTime(overtime.end_time);
        
        if (currentTimeMinutes >= overtimeStart && currentTimeMinutes <= overtimeEnd) {
          shouldBlock = false;
          blockReason = '';
        }
      }
    }

    // Only block if auto_block is enabled
    if (!schedule.auto_block_enabled) {
      shouldBlock = false;
    }

    // Log the block event if blocking
    if (shouldBlock) {
      await supabase.from('station_block_logs').insert({
        employee_name: employee_name,
        device: agentKey.device_name || 'Unknown',
        block_type: 'auto_blocked',
        reason: blockReason
      });
    }

    console.log(`Schedule check for ${employee_name}: block=${shouldBlock}, reason=${blockReason}`);

    return new Response(
      JSON.stringify({
        schedule: {
          name: schedule.name,
          work_days: schedule.work_days,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          lunch_start: schedule.lunch_start,
          lunch_end: schedule.lunch_end,
          grace_period_minutes: schedule.grace_period_minutes,
          auto_block_enabled: schedule.auto_block_enabled,
          allow_overtime: schedule.allow_overtime
        },
        block_station: shouldBlock,
        reason: blockReason,
        is_lunch_break: isLunchBreak,
        current_time: now.toISOString(),
        is_work_day: isWorkDay
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-employee-schedule:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
