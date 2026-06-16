import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewDeviceNotification {
  userId: string;
  email: string;
  deviceInfo: {
    ipAddress: string;
    userAgent: string;
    browserName: string;
    osName: string;
    deviceType: string;
    location?: string;
  };
  loginTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, email, deviceInfo, loginTime }: NewDeviceNotification = await req.json();

    console.log(`Processing new device notification for user: ${userId}`);

    // Log the security event
    await supabase.from("login_security_events").insert({
      user_id: userId,
      event_type: "new_device_login",
      ip_address: deviceInfo.ipAddress,
      user_agent: deviceInfo.userAgent,
      device_fingerprint: `${deviceInfo.browserName}-${deviceInfo.osName}-${deviceInfo.ipAddress}`,
      location: deviceInfo.location,
      metadata: {
        browser: deviceInfo.browserName,
        os: deviceInfo.osName,
        device_type: deviceInfo.deviceType,
        login_time: loginTime,
      },
    });

    // Send email notification via Resend API
    const formattedTime = new Date(loginTime).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "full",
      timeStyle: "medium",
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .device-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .device-info h3 { margin: 0 0 15px 0; color: #667eea; }
          .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
          .info-label { font-weight: 600; width: 120px; color: #6b7280; }
          .info-value { color: #111827; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Alerta de Segurança</h1>
            <p>Novo dispositivo detectado</p>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p>Detectamos um login em sua conta a partir de um <strong>novo dispositivo ou localização</strong>. Se foi você, pode ignorar este email.</p>
            
            <div class="device-info">
              <h3>📱 Informações do Dispositivo</h3>
              <div class="info-row">
                <span class="info-label">📅 Data/Hora:</span>
                <span class="info-value">${formattedTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🌐 IP:</span>
                <span class="info-value">${deviceInfo.ipAddress}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🖥️ Navegador:</span>
                <span class="info-value">${deviceInfo.browserName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">💻 Sistema:</span>
                <span class="info-value">${deviceInfo.osName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📍 Tipo:</span>
                <span class="info-value">${deviceInfo.deviceType}</span>
              </div>
              ${deviceInfo.location ? `
              <div class="info-row">
                <span class="info-label">📍 Local:</span>
                <span class="info-value">${deviceInfo.location}</span>
              </div>
              ` : ""}
            </div>
            
            <div class="warning">
              <strong>⚠️ Não reconhece este acesso?</strong>
              <p>Se você não realizou este login, sua conta pode estar comprometida. Recomendamos:</p>
              <ul>
                <li>Alterar sua senha imediatamente</li>
                <li>Ativar autenticação de dois fatores (2FA)</li>
                <li>Revisar os dispositivos conectados</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Este é um email automático de segurança do Sentinela.</p>
            <p>© ${new Date().getFullYear()} Sentinela - Sistema de Monitoramento</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sentinela Security <security@resend.dev>",
        to: [email],
        subject: "🔐 Novo dispositivo detectado em sua conta",
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email notification sent:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailResult }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-new-device:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
