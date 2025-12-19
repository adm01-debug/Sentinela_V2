import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimitConfig } from '../_shared/rateLimiting.ts';
import { 
  sendWhatsAppSchema, 
  validateInput, 
  createValidationErrorResponse 
} from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60 * 1000,
  identifier: 'send-whatsapp',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, RATE_LIMIT_CONFIG);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    
    // Handle test request
    if (body.test === true) {
      return new Response(
        JSON.stringify({ success: true, message: 'WhatsApp connection test successful' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = validateInput(sendWhatsAppSchema, body);
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.error, validation.details, corsHeaders);
    }

    const { to, message, template_name, template_params } = validation.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get WhatsApp settings
    const { data: settings, error: settingsError } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (settingsError || !settings) {
      throw new Error('WhatsApp not configured or inactive');
    }

    // Prepare message payload
    const whatsappPayload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      to,
    };

    if (template_name) {
      whatsappPayload.type = 'template';
      whatsappPayload.template = {
        name: template_name,
        language: { code: 'pt_BR' },
        components: template_params ? [
          {
            type: 'body',
            parameters: Object.values(template_params).map(value => ({
              type: 'text',
              text: value,
            })),
          },
        ] : [],
      };
    } else {
      whatsappPayload.type = 'text';
      whatsappPayload.text = { body: message };
    }

    // Send via WhatsApp Business API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${settings.phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whatsappPayload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to send WhatsApp message');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message_id: result.messages?.[0]?.id,
        to,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
