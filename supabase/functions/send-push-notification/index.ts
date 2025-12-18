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
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log the notification
    console.log(`Push notification: ${title} - ${body}`);

    // Get admin emails if not provided
    let emails = recipient_emails || [];
    if (emails.length === 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .limit(10);
      
      emails = profiles?.map(p => p.email).filter(Boolean) || [];
    }

    // Send email notification for critical violations
    const emailsSent: string[] = [];
    if (RESEND_API_KEY && emails.length > 0 && (severity === 'critical' || severity === 'high')) {
      const severityEmoji = severity === 'critical' ? '🚨' : '⚠️';
      const severityColor = severity === 'critical' ? '#dc2626' : '#f59e0b';
      
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
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${body}
              </p>
              ${data?.employee_name ? `<p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;"><strong>Funcionário:</strong> ${data.employee_name}</p>` : ''}
              ${data?.device ? `<p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;"><strong>Dispositivo:</strong> ${data.device}</p>` : ''}
              ${data?.timestamp ? `<p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;"><strong>Data/Hora:</strong> ${new Date(data.timestamp).toLocaleString('pt-BR')}</p>` : ''}
              <div style="margin-top: 30px; text-align: center;">
                <a href="${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/violations" 
                   style="display: inline-block; background: ${severityColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Ver Detalhes
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                SecureWatch - Sistema de Monitoramento
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

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
              subject: `${severityEmoji} ${title}`,
              html: htmlContent,
            }),
          });

          if (emailResponse.ok) {
            emailsSent.push(email);
            console.log(`Email sent to: ${email}`);
          } else {
            const errorText = await emailResponse.text();
            console.error(`Failed to send email to ${email}:`, errorText);
          }
        } catch (emailError) {
          console.error(`Error sending email to ${email}:`, emailError);
        }
      }
    }

    // Update violation as notified
    if (violation_id) {
      await supabase
        .from('security_violations')
        .update({ notified_admin: true })
        .eq('id', violation_id);
    }

    // Store notification in database for in-app display
    const { error: insertError } = await supabase
      .from('security_violations')
      .update({
        notified_admin: true,
        notified_employee: data?.notify_employee || false
      })
      .eq('id', violation_id);

    if (insertError) {
      console.error('Error updating notification status:', insertError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent',
        emails_sent: emailsSent.length,
        emails: emailsSent
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
