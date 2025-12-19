import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  recipient_number: string;
  message: string;
  message_type?: string;
  violation_id?: string;
  phone_number_id: string;
}

interface WhatsAppBatchRequest {
  recipient_numbers: string[];
  message: string;
  message_type?: string;
  violation_id?: string;
  phone_number_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("WHATSAPP_ACCESS_TOKEN not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Received WhatsApp request:", JSON.stringify(body));

    // Check if it's a batch request
    if (body.recipient_numbers && Array.isArray(body.recipient_numbers)) {
      const batchRequest = body as WhatsAppBatchRequest;
      const results = [];

      for (const recipientNumber of batchRequest.recipient_numbers) {
        const result = await sendWhatsAppMessage({
          recipient_number: recipientNumber,
          message: batchRequest.message,
          message_type: batchRequest.message_type,
          violation_id: batchRequest.violation_id,
          phone_number_id: batchRequest.phone_number_id,
        }, accessToken, supabase);
        results.push(result);
      }

      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single message request
    const request = body as WhatsAppRequest;
    const result = await sendWhatsAppMessage(request, accessToken, supabase);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-whatsapp function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function sendWhatsAppMessage(
  request: WhatsAppRequest,
  accessToken: string,
  supabase: any
) {
  const { recipient_number, message, message_type = "alert", violation_id, phone_number_id } = request;

  // Format phone number (remove non-digits except +)
  const formattedNumber = recipient_number.replace(/[^\d+]/g, "").replace(/^\+/, "");

  console.log(`Sending WhatsApp message to ${formattedNumber}`);

  try {
    // Send message via WhatsApp Business API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedNumber,
          type: "text",
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    );

    const data = await response.json();
    console.log("WhatsApp API response:", JSON.stringify(data));

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to send WhatsApp message");
    }

    // Log successful message
    await supabase.from("whatsapp_message_logs").insert({
      recipient_number: formattedNumber,
      message_type,
      message_content: message,
      status: "sent",
      whatsapp_message_id: data.messages?.[0]?.id,
      violation_id: violation_id || null,
    });

    return {
      success: true,
      message_id: data.messages?.[0]?.id,
      recipient: formattedNumber,
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error sending to ${formattedNumber}:`, error);

    // Log failed message
    await supabase.from("whatsapp_message_logs").insert({
      recipient_number: formattedNumber,
      message_type,
      message_content: message,
      status: "failed",
      error_message: errorMessage,
      violation_id: violation_id || null,
    });

    return {
      success: false,
      error: errorMessage,
      recipient: formattedNumber,
    };
  }
}
