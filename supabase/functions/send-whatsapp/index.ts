// ============================================================
// SEND WHATSAPP EDGE FUNCTION
// Sends WhatsApp messages via WAHA API with rate limiting
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { validateRequest, ValidationError } from '../_shared/validation.ts';
import { createRateLimiter, rateLimitResponse, addRateLimitHeaders } from '../_shared/rateLimiting.ts';

// ============================================================
// CORS HEADERS
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// RATE LIMITER
// ============================================================

const rateLimiter = createRateLimiter('WHATSAPP');

// ============================================================
// TYPES
// ============================================================

interface SendMessageRequest {
  phone: string;
  message: string;
  templateId?: string;
  variables?: Record<string, string>;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request
    const { data, userId } = await validateRequest<SendMessageRequest>(req, {
      requiredFields: ['phone', 'message'],
      allowedFields: ['phone', 'message', 'templateId', 'variables', 'mediaUrl', 'mediaType'],
    });

    // Check rate limit
    const rateLimitResult = rateLimiter.check(`whatsapp:${userId}`);
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for user ${userId}`);
      return rateLimitResponse(rateLimitResult);
    }

    // Get WAHA configuration
    const wahaUrl = Deno.env.get('WAHA_API_URL');
    const wahaKey = Deno.env.get('WAHA_API_KEY');
    const wahaSession = Deno.env.get('WAHA_SESSION') || 'default';

    if (!wahaUrl || !wahaKey) {
      throw new Error('WAHA configuration not found');
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(data.phone);

    // Build message payload
    const payload = buildMessagePayload(data, formattedPhone, wahaSession);

    // Send message via WAHA
    const response = await fetch(`${wahaUrl}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wahaKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WAHA error:', errorText);
      throw new Error(`WAHA API error: ${response.status}`);
    }

    const result = await response.json();

    // Log to database
    await logMessage(userId, data.phone, data.message, 'sent');

    // Return success with rate limit headers
    const successResponse = new Response(
      JSON.stringify({
        success: true,
        messageId: result.id || result.key?.id,
        phone: formattedPhone,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

    return addRateLimitHeaders(successResponse, rateLimitResult);

  } catch (error) {
    console.error('Error sending WhatsApp:', error);

    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message, details: error.details }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to send message', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Add Brazil country code if not present
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  // Add @c.us suffix for WhatsApp
  return `${cleaned}@c.us`;
}

function buildMessagePayload(
  data: SendMessageRequest,
  phone: string,
  session: string
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    chatId: phone,
    session,
  };

  // Handle media messages
  if (data.mediaUrl && data.mediaType) {
    payload.text = data.message;
    payload.media = {
      url: data.mediaUrl,
      caption: data.message,
    };
  } else {
    // Plain text message
    payload.text = data.message;
  }

  return payload;
}

async function logMessage(
  userId: string,
  phone: string,
  message: string,
  status: 'sent' | 'failed'
): Promise<void> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase.from('whatsapp_logs').insert({
      user_id: userId,
      phone,
      message: message.substring(0, 500), // Truncate for storage
      status,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log message:', err);
    // Don't throw - logging failure shouldn't break the main flow
  }
}
