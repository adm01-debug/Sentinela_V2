import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';
import {
  toEvJid,
  extractEvMessageId,
  buildEvMediaBody,
  type EvolutionConfig,
} from '../_shared/whatsapp-evolution.ts';

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

    const results: Array<{
      to: string;
      success: boolean;
      message_id?: string;
      error?: string;
    }> = [];

    /** Envio via Evolution GO (contrato do Zapp_Web_V2). */
    const sendEvolution = async (msg: z.infer<typeof WhatsAppMessageSchema>) => {
      const evoUrl = Deno.env.get('EVOLUTION_API_URL');
      const evoToken = Deno.env.get('EVOLUTION_API_KEY') || Deno.env.get('EVOLUTION_INSTANCE_TOKEN');
      const instance = Deno.env.get('EVOLUTION_INSTANCE_NAME') || 'PRINCIPAL';

      if (!evoUrl || !evoToken) {
        throw new Error('Evolution API not configured (EVOLUTION_API_URL / EVOLUTION_API_KEY)');
      }
      const base = evoUrl.replace(/\/+$/, '');
      const cfg: EvolutionConfig = { url: base, token: evoToken, instanceName: instance };

      // Template (v2 Evolution) -> /message/sendTemplate/{instancia}
      if (msg.template_name) {
        // A Evolution GO do Zapp documenta sendTemplate como NÃO suportado
        // (https://github.com/adm01-debug/Zapp_Web_V2 -> evolution-go-routes.ts:365).
        // Falha explícita em vez de rota inexistente (404).
        throw new Error('Evolution provider does not support template_name; send text or media');
      }

      // Mídia (imagem/documento/video/audio) -> /send/media
      if (msg.media_url && msg.media_type) {
        const body = buildEvMediaBody(msg.to, msg.media_url, msg.media_type, msg.message);
        const response = await fetch(`${base}/send/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: cfg.token },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Evolution media failed (${response.status}): ${errorBody.slice(0, 200)}`);
        }
        return extractEvMessageId(await response.json());
      }

      // Texto -> /send/text
      const payload = {
        number: toEvJid(msg.to),
        text: msg.message ?? '',
        ...(msg.reply_to ? { quoted: { messageId: msg.reply_to } } : {}),
      };
      const response = await fetch(`${base}/send/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: cfg.token },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Evolution text failed (${response.status}): ${errorBody.slice(0, 200)}`);
      }
      return extractEvMessageId(await response.json());
    };

    /** Envio via Meta Graph (legado). */
    const sendMeta = async (msg: z.infer<typeof WhatsAppMessageSchema>): Promise<string> => {
      const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
      const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

      if (!accessToken || !phoneNumberId) {
        throw new Error('WhatsApp API not configured (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID)');
      }

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
        return result.messages[0].id;
      }
      throw new Error(result.error?.message || 'Unknown error');
    };

    for (const msg of messages) {
      try {
        // Roteador: Evolution (env EVOLUTION_API_URL) tem prioridade; senão Meta.
        // A função roda duas vezes: uma com as envs de produção, e nesta mesma
        // execução pode haver mensagens híbridas — mas a escolha é por execução.
        // (única forma de escolher provider é via variável de ambiente no deploy)
        const provider = Deno.env.get('WHATSAPP_PROVIDER') || 'meta';
        const messageId =
          provider === 'evolution'
            ? await sendEvolution(msg)
            : await sendMeta(msg);

        if (messageId) {
          results.push({
            to: msg.to,
            success: true,
            message_id: messageId,
          });
        } else {
          results.push({
            to: msg.to,
            success: false,
            error: 'No message id returned',
          });
        }
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : 'Unknown error';
        results.push({
          to: msg.to,
          success: false,
          error: errMessage,
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
