import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { Logger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ValidateKeySchema = z.object({
  agentKey: z.string().min(1),
  deviceInfo: z.record(z.unknown()).optional(),
});

serve(async (req) => {
  const logger = new Logger('validate-agent-key');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const validation = ValidateKeySchema.safeParse(body);
    
    if (!validation.success) {
      await logger.log(supabase, { status: 400, method: req.method, error_message: 'Invalid input' });
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { agentKey, deviceInfo } = validation.data;

    // Use agent_key column based on agent-collector usage
    const { data: key, error } = await supabase
      .from('agent_keys')
      .select('id, company_id, employee_name, is_active')
      .eq('agent_key', agentKey)
      .eq('is_active', true)
      .single();

    if (error || !key) {
      await logger.log(supabase, { status: 401, method: req.method, error_message: 'Invalid agent key' });
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid or inactive agent key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update metadata
    await supabase
      .from('agent_keys')
      .update({
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', key.id);

    await logger.log(supabase, { 
      status: 200, 
      method: req.method, 
      agent_key_id: key.id, 
      company_id: key.company_id 
    });

    return new Response(
      JSON.stringify({
        valid: true,
        company_id: key.company_id,
        employee_name: key.employee_name,
        config: {
          screenshotInterval: 300,
          keystrokeLogging: true,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    await logger.log(supabase, { status: 500, method: req.method, error_message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
