import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation Schemas
const WhatsAppMessageSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  template_name: z.string().min(1).max(100).optional(),
  template_language: z.string().default('pt_BR'),
  template_params: z.array(z.string()).optional(),
  message: z.string().min(1).max(4096).optional(),
  media_url: z.string().url().optional(),
  media_type: z.enum(['image', 'document', 'video', 'audio']).optional(),
  reply_to: z.string().optional(),
}).refine(
  data => data.template_name || data.message,
  { message: 'Either template_name or message is required' }
);

const BulkWhatsAppSchema = z.object({
  messages: z.array(WhatsAppMessageSchema).min(1).max(100),
  batch_id: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'send-whatsapp', 30, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    
    // Check if it's a bulk request or single message
    const isBulk = Array.isArray(body.messages);
    
    let messages: z.infer<typeof WhatsAppMessageSchema>[];
    
    if (isBulk) {
      const validation = BulkWhatsAppSchema.safeParse(body);
      if (!validation.success) {
        return new Response(
          JSON.stringify({ error: 'Validation failed', details: validation.error.flatten() }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      messages = validation.data.messages;
    } else {
      const validation = WhatsAppMessageSchema.safeParse(body);
      if (!validation.success) {
        return new Response(
          JSON.stringify({ error: 'Validation failed', details: validation.error.flatten() }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      messages = [validation.data];
    }

    // Get WhatsApp API credentials
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!accessToken || !phoneNumberId) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Array<{
      to: string;
      success: boolean;
      message_id?: string;
      error?: string;
    }> = [];

    for (const msg of messages) {
      try {
        let payload: Record<string, unknown>;

        if (msg.template_name) {
          // Template message
          payload = {
            messaging_product: 'whatsapp',
            to: msg.to.replace(/\D/g, ''),
            type: 'template',
            template: {
              name: msg.template_name,
              language: { code: msg.template_language },
              components: msg.template_params?.length ? [
                {
                  type: 'body',
                  parameters: msg.template_params.map(p => ({ type: 'text', text: p })),
                },
              ] : undefined,
            },
          };
        } else if (msg.media_url && msg.media_type) {
          // Media message
          payload = {
            messaging_product: 'whatsapp',
            to: msg.to.replace(/\D/g, ''),
            type: msg.media_type,
            [msg.media_type]: {
              link: msg.media_url,
              caption: msg.message,
            },
          };
        } else {
          // Text message
          payload = {
            messaging_product: 'whatsapp',
            to: msg.to.replace(/\D/g, ''),
            type: 'text',
            text: {
              body: msg.message,
              preview_url: true,
            },
          };
        }

        if (msg.reply_to) {
          payload.context = { message_id: msg.reply_to };
        }

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();

        if (response.ok && result.messages?.[0]?.id) {
          results.push({
            to: msg.to,
            success: true,
            message_id: result.messages[0].id,
          });
        } else {
          results.push({
            to: msg.to,
            success: false,
            error: result.error?.message || 'Unknown error',
          });
        }
      } catch (err) {
        results.push({
          to: msg.to,
          success: false,
          error: err.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: failCount === 0,
        total: results.length,
        sent: successCount,
        failed: failCount,
        results: isBulk ? results : results[0],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('WhatsApp send error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
