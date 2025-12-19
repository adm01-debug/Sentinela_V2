// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// ============================================================
// VALIDAÇÃO DE INPUT
// ============================================================

interface WhatsAppRequest {
  to: string;
  message?: string;
  template_id?: string;
  variables?: Record<string, string>;
}

function validatePhone(value: unknown, fieldName: string): string {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} é obrigatório e deve ser uma string`);
  }
  const cleaned = value.replace(/[\s-()]/g, '');
  const phoneRegex = /^\+?[1-9]\d{10,14}$/;
  if (!phoneRegex.test(cleaned)) {
    throw new Error(`${fieldName} deve ser um número de telefone válido (ex: +5562999999999)`);
  }
  return value;
}

function validateRequest(data: unknown): WhatsAppRequest {
  if (!data || typeof data !== 'object') {
    throw new Error('Request body inválido');
  }
  
  const obj = data as Record<string, unknown>;
  
  // Validar telefone (obrigatório)
  const to = validatePhone(obj.to, 'to');
  
  // Validar message ou template_id (pelo menos um é obrigatório)
  const message = obj.message as string | undefined;
  const template_id = obj.template_id as string | undefined;
  
  if (!message && !template_id) {
    throw new Error('É necessário fornecer "message" ou "template_id"');
  }
  
  if (message && typeof message !== 'string') {
    throw new Error('"message" deve ser uma string');
  }
  
  if (message && message.length > 4096) {
    throw new Error('"message" não pode ter mais de 4096 caracteres');
  }
  
  if (template_id && typeof template_id !== 'string') {
    throw new Error('"template_id" deve ser uma string');
  }
  
  return {
    to,
    message,
    template_id,
    variables: obj.variables as Record<string, string> | undefined,
  };
}

// ============================================================
// CORS HEADERS
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'JSON inválido no body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validar input
    let validatedData: WhatsAppRequest;
    try {
      validatedData = validateRequest(body);
    } catch (validationError: any) {
      return new Response(
        JSON.stringify({ error: validationError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get WhatsApp settings from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings, error: settingsError } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (settingsError || !settings) {
      console.error('WhatsApp settings error:', settingsError);
      return new Response(
        JSON.stringify({ error: 'WhatsApp não configurado ou inativo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get message content
    let messageContent = validatedData.message;
    
    if (validatedData.template_id) {
      const { data: template, error: templateError } = await supabase
        .from('message_templates')
        .select('content')
        .eq('id', validatedData.template_id)
        .single();

      if (templateError || !template) {
        return new Response(
          JSON.stringify({ error: 'Template não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      messageContent = template.content;
      
      // Replace variables
      if (validatedData.variables) {
        for (const [key, value] of Object.entries(validatedData.variables)) {
          messageContent = messageContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
      }
    }

    // Send via WAHA API
    const wahaUrl = `${settings.api_url}/api/sendText`;
    
    const wahaResponse = await fetch(wahaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.api_key}`,
      },
      body: JSON.stringify({
        chatId: `${validatedData.to}@c.us`,
        text: messageContent,
        session: settings.session_name || 'default',
      }),
    });

    if (!wahaResponse.ok) {
      const errorText = await wahaResponse.text();
      console.error('WAHA error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Falha ao enviar mensagem', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await wahaResponse.json();

    // Log success
    await supabase.from('message_logs').insert({
      channel: 'whatsapp',
      recipient: validatedData.to,
      content: messageContent,
      status: 'sent',
      provider_response: result,
    });

    return new Response(
      JSON.stringify({ success: true, message_id: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
