import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, any>;
  recipient_emails?: string[];
  violation_id?: string;
  severity?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, icon, data, recipient_emails, violation_id, severity }: PushNotification = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email notification');
      return new Response(
        JSON.stringify({ success: true, message: 'Email notifications disabled - no API key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get alert notification settings
    const { data: alertSettings } = await supabase
      .from('alert_notification_settings')
      .select('*')
      .eq('setting_type', 'violation_alerts')
      .single();

    // Check if notifications are enabled
    if (alertSettings && !alertSettings.enabled) {
      console.log('Alert notifications are disabled');
      return new Response(
        JSON.stringify({ success: true, message: 'Notifications disabled in settings' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check severity filter
    if (severity && alertSettings) {
      const severityEnabled = {
        'critical': alertSettings.notify_critical,
        'high': alertSettings.notify_high,
        'medium': alertSettings.notify_medium,
        'low': alertSettings.notify_low
      }[severity];

      if (!severityEnabled) {
        console.log(`Notifications for severity '${severity}' are disabled`);
        return new Response(
          JSON.stringify({ success: true, message: `Notifications for ${severity} severity disabled` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get email recipients
    let emails = recipient_emails || [];
    
    // Use configured recipients from settings if available
    if (alertSettings?.recipient_emails?.length > 0) {
      emails = alertSettings.recipient_emails;
    }

    // Fallback to admin profiles if no configured emails
    if (emails.length === 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .limit(10);
      
      emails = profiles?.map(p => p.email).filter(Boolean) || [];
    }

    if (emails.length === 0) {
      console.log('No email recipients configured');
      return new Response(
        JSON.stringify({ success: true, message: 'No recipients configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending alert to ${emails.length} recipient(s)`);

    // Build email content
    const severityEmoji = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : 'ℹ️';
    const severityColor = severity === 'critical' ? '#dc2626' : severity === 'high' ? '#f59e0b' : '#3b82f6';
    const severityLabel = {
      'critical': 'Crítica',
      'high': 'Alta',
      'medium': 'Média',
      'low': 'Baixa'
    }[severity || 'medium'] || 'Média';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: ${severityColor}; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${severityEmoji} ${title}</h1>
          </div>
          <div style="padding: 30px;">
            <div style="background: #f8f9fa; border-left: 4px solid ${severityColor}; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                ${body}
              </p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Severidade:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  <span style="background: ${severityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${severityLabel}</span>
                </td>
              </tr>
              ${data?.employee_name ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Funcionário:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.employee_name}</td>
              </tr>` : ''}
              ${data?.device ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Dispositivo:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.device}</td>
              </tr>` : ''}
              ${data?.violation_type ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Tipo:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.violation_type}</td>
              </tr>` : ''}
              ${data?.timestamp ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Data/Hora:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${new Date(data.timestamp).toLocaleString('pt-BR')}</td>
              </tr>` : ''}
            </table>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/violations" 
                 style="display: inline-block; background: ${severityColor}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Ver Detalhes no Dashboard
              </a>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              SecureWatch - Sistema de Monitoramento Corporativo
            </p>
            <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0;">
              Este é um email automático. Para gerenciar suas preferências de notificação, acesse as configurações do sistema.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails
    const emailsSent: string[] = [];
    const emailsFailed: string[] = [];

    for (const email of emails) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'SecureWatch <onboarding@resend.dev>',
            to: [email],
            subject: `${severityEmoji} [SecureWatch] ${title}`,
            html: htmlContent,
          }),
        });

        if (emailResponse.ok) {
          emailsSent.push(email);
          console.log(`Email sent to: ${email}`);
        } else {
          const errorText = await emailResponse.text();
          console.error(`Failed to send email to ${email}:`, errorText);
          emailsFailed.push(email);
        }
      } catch (emailError) {
        console.error(`Error sending email to ${email}:`, emailError);
        emailsFailed.push(email);
      }
    }

    // Update violation as notified
    if (violation_id) {
      await supabase
        .from('security_violations')
        .update({ 
          notified_admin: true,
          notified_employee: data?.notify_employee || false 
        })
        .eq('id', violation_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent to ${emailsSent.length} recipient(s)`,
        emails_sent: emailsSent.length,
        emails_failed: emailsFailed.length,
        sent_to: emailsSent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
