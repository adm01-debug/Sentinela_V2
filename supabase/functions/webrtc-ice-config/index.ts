import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const TURN_CREDENTIALS = Deno.env.get('TURN_CREDENTIALS');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization');
    if (!auth) return json({ error: 'unauthorized' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes.user) return json({ error: 'unauthorized' }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: hasRole } = await admin.rpc('has_role', {
      _user_id: userRes.user.id,
      _role: 'admin',
    });
    if (!hasRole) return json({ error: 'forbidden' }, 403);

    const stunServers = [
      { urls: 'stun:stun.l.google.com:19302', label: 'Google STUN' },
      { urls: 'stun:stun1.l.google.com:19302', label: 'Google STUN 1' },
      { urls: 'stun:stun.cloudflare.com:3478', label: 'Cloudflare STUN' },
    ];

    let turnServers: Array<{ urls: string | string[]; username?: string; credential?: string; label: string }> = [];
    let turnConfigured = false;
    let turnError: string | null = null;
    if (TURN_CREDENTIALS) {
      turnConfigured = true;
      try {
        const parsed = JSON.parse(TURN_CREDENTIALS);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        turnServers = arr.map((s, i) => ({ ...s, label: s.label ?? `TURN #${i + 1}` }));
      } catch (e) {
        turnError = `TURN_CREDENTIALS inválido: ${(e as Error).message}`;
      }
    }

    return json({
      stun_servers: stunServers,
      turn_servers: turnServers,
      turn_configured: turnConfigured,
      turn_error: turnError,
    });
  } catch (e) {
    return json({ error: 'internal', detail: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
