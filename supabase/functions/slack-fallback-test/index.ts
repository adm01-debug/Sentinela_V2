import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Parse mode do body (chaos engineering) — default 'real'
    type ChaosMode = 'real' | 'timeout' | 'error_429' | 'error_500' | 'partial_failure';
    let mode: ChaosMode = 'real';
    if (req.method !== 'GET') {
      try {
        const bodyJson = await req.json().catch(() => ({}));
        const requested = (bodyJson?.mode ?? 'real') as string;
        if (['real', 'timeout', 'error_429', 'error_500', 'partial_failure'].includes(requested)) {
          mode = requested as ChaosMode;
        }
      } catch { /* noop */ }
    }

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

    // Rate limit: máx 5 testes / 10min por admin (previne abuso e custo Resend)
    const { data: rl } = await supabase.rpc('check_rate_limit', {
      p_identifier: userData.user.id,
      p_identifier_type: 'user',
      p_endpoint: 'slack-fallback-test',
      p_max_requests: 5,
      p_window_seconds: 600,
    });
    const rateLimit = rl as { allowed: boolean; retry_after_seconds?: number } | null;
    if (rateLimit && !rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'rate_limited',
          message: 'Limite de 5 testes a cada 10 minutos atingido',
          retry_after_seconds: rateLimit.retry_after_seconds,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.retry_after_seconds ?? 600),
          },
        },
      );
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
    let resendId: string | null = null;
    try { resendId = (JSON.parse(body) as { id?: string }).id ?? null; } catch { /* noop */ }

    // Auditoria — persiste em edge_function_logs para o card de histórico
    await supabase.from('edge_function_logs').insert({
      function_name: 'slack-fallback-test',
      status: emailRes.ok ? 'success' : 'error',
      metadata: {
        triggered_by: userData.user.email,
        user_id: userData.user.id,
        recipients_count: recipients.length,
        recipients,
        resend_status: emailRes.status,
        resend_id: resendId,
        error: emailRes.ok ? null : body.slice(0, 500),
      },
    });

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
        resend_id: resendId,
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
