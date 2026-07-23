import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace('Bearer ', '');
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'invalid_token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: userData.user.id,
      _role: 'admin',
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured', configured: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: settings } = await supabase
      .from('alert_notification_settings')
      .select('recipient_emails, enabled')
      .eq('setting_type', 'slack_fallback')
      .maybeSingle();

    if (!settings || !settings.enabled) {
      return new Response(
        JSON.stringify({ error: 'Fallback desabilitado nas configurações' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const recipients = (settings.recipient_emails ?? []) as string[];
    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum destinatário configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'SecureWatch <alerts@securewatch.app>';
    const html = `
      <div style="font-family: system-ui, sans-serif; padding: 24px; background: #f9fafb;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 8px; padding: 24px;">
          <h2 style="margin: 0 0 12px; color: #111827;">Teste de Fallback Resend</h2>
          <p style="color: #4b5563;">
            Este é um <b>e-mail de teste</b> disparado manualmente do painel de auditoria.
            Se você recebeu esta mensagem, o fallback via Resend está funcionando corretamente.
          </p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
            Disparado por: ${userData.user.email} · ${new Date().toISOString()}
          </p>
        </div>
      </div>
    `;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: '[TESTE] Fallback Resend - SecureWatch',
        html,
      }),
    });

    const body = await emailRes.text();
    if (!emailRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Falha no envio', status: emailRes.status, details: body }),
        { status: emailRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        recipients: recipients.length,
        message: `Teste enviado para ${recipients.length} destinatário(s)`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
