import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GetScheduleSchema = z.object({
  employee_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'get-schedule', 60, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const params = {
      employee_id: url.searchParams.get('employee_id'),
      date: url.searchParams.get('date'),
    };

    const validationResult = GetScheduleSchema.safeParse(params);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { employee_id, date } = validationResult.data;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get employee's schedule assignment
    const { data: assignment, error: assignError } = await supabase
      .from('employee_schedules')
      .select('*, work_schedules(*)')
      .eq('employee_id', employee_id)
      .lte('effective_date', targetDate)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (assignError || !assignment) {
      return new Response(
        JSON.stringify({ error: 'No schedule found', schedule: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const schedule = assignment.work_schedules;
    const dayOfWeek = new Date(targetDate).getDay();
    const isWorkDay = schedule.work_days?.includes(dayOfWeek);

    return new Response(
      JSON.stringify({
        success: true,
        schedule: {
          ...schedule,
          is_work_day: isWorkDay,
          effective_date: assignment.effective_date,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
