import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimitAlertRequest {
  identifier: string;
  identifier_type: string;
  endpoint: string;
  request_count: number;
  threshold: number;
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Segurança <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Resend API error: ${errorData}`);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Email send error: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { identifier, identifier_type, endpoint, request_count, threshold }: RateLimitAlertRequest = await req.json();

    console.log(`Rate limit alert triggered for ${identifier_type}: ${identifier} on ${endpoint}`);

    // Get alert settings to find recipients
    const { data: settings } = await supabase
      .from("alert_notification_settings")
      .select("*")
      .eq("setting_type", "push_notification")
      .single();

    let recipients: string[] = [];

    if (settings?.enabled && settings?.recipient_emails?.length > 0) {
      recipients = settings.recipient_emails;
    } else {
      // Fallback: get admin emails from profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("email")
        .limit(5);
      
      if (profiles) {
        recipients = profiles.map((p: { email: string }) => p.email).filter(Boolean);
      }
    }

    if (recipients.length === 0) {
      console.log("No recipients configured for rate limit alerts");
      return new Response(
        JSON.stringify({ success: false, message: "No recipients configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const severityColor = request_count > threshold * 3 ? "#dc2626" : request_count > threshold * 2 ? "#f97316" : "#eab308";
    const severityText = request_count > threshold * 3 ? "CRÍTICO" : request_count > threshold * 2 ? "ALTO" : "MÉDIO";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: ${severityColor}; color: white; padding: 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; }
          .alert-box { background: #fef3c7; border-left: 4px solid ${severityColor}; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { color: #666; font-weight: 500; }
          .detail-value { color: #333; font-weight: 600; }
          .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: ${severityColor}; color: white; font-weight: bold; font-size: 12px; }
          .footer { background: #f9fafb; padding: 15px 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Alerta de Rate Limiting</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <strong>Atividade suspeita detectada!</strong>
              <p>Múltiplas tentativas bloqueadas de um mesmo origem foram detectadas.</p>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Severidade</span>
              <span class="severity-badge">${severityText}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Tipo de Identificador</span>
              <span class="detail-value">${identifier_type === 'ip' ? 'Endereço IP' : identifier_type === 'agent_key' ? 'Chave do Agente' : identifier_type}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Identificador</span>
              <span class="detail-value" style="font-family: monospace;">${identifier}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Endpoint Alvo</span>
              <span class="detail-value">${endpoint}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Tentativas</span>
              <span class="detail-value" style="color: ${severityColor};">${request_count} (limite: ${threshold})</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Data/Hora</span>
              <span class="detail-value">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
            </div>
            
            <p style="margin-top: 20px; color: #666;">
              <strong>Ação recomendada:</strong> Verifique o dashboard de Rate Limiting para mais detalhes e considere bloquear permanentemente este IP se o comportamento persistir.
            </p>
          </div>
          <div class="footer">
            Este é um email automático do sistema de monitoramento de segurança.
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResults = [];
    for (const email of recipients) {
      const result = await sendEmail(email, `[${severityText}] Alerta de Rate Limiting - ${identifier}`, htmlContent);
      emailResults.push({ email, ...result });
      if (result.success) {
        console.log(`Alert email sent to ${email}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-rate-limit-alert:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
