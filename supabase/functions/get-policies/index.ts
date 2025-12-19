import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GetPoliciesSchema = z.object({
  active_only: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  category: z.string().optional(),
  employee_id: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'get-policies', 30, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const params = {
      active_only: url.searchParams.get('active_only') || undefined,
      category: url.searchParams.get('category') || undefined,
      employee_id: url.searchParams.get('employee_id') || undefined,
    };

    const validationResult = GetPoliciesSchema.safeParse(params);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { active_only, category, employee_id } = validationResult.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase.from('policies').select('*');

    if (active_only) {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: policies, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // If employee_id provided, check acknowledgments
    let acknowledgments: Record<string, boolean> = {};
    if (employee_id && policies) {
      const { data: acks } = await supabase
        .from('policy_acknowledgments')
        .select('policy_id')
        .eq('employee_id', employee_id);

      if (acks) {
        acks.forEach(ack => {
          acknowledgments[ack.policy_id] = true;
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        policies: policies?.map(p => ({
          ...p,
          acknowledged: employee_id ? !!acknowledgments[p.id] : undefined,
        })),
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
