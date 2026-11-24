import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildIceServerEntries } from '../_shared/iceServers.ts';

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

    // Fonte unica com o live view: se o diagnostico montasse a lista por conta
    // propria ele poderia exibir um ICE diferente do que o navegador recebe.
    const ice = buildIceServerEntries(TURN_CREDENTIALS);
    if (ice.skipped > 0) {
      console.warn(`TURN_CREDENTIALS: ${ice.skipped} entrada(s) sem urls ignorada(s)`);
    }
    if (ice.error) {
      console.warn(`TURN_CREDENTIALS invalido: ${ice.error}`);
    }

    const urlsOf = (server: { urls: string | string[] }) =>
      Array.isArray(server.urls) ? server.urls : [server.urls];
    const isTurn = (entry: { server: { urls: string | string[] } }) =>
      urlsOf(entry.server).some((url) => url.startsWith('turn'));

    const stunServers = ice.entries
      .filter((entry) => !isTurn(entry))
      .map((entry, i) => ({
        ...entry.server,
        label: entry.label ?? (i === 0 ? 'STUN padrão' : `STUN #${i + 1}`),
      }));
    const turnServers = ice.entries
      .filter(isTurn)
      .map((entry, i) => ({ ...entry.server, label: entry.label ?? `TURN #${i + 1}` }));

    return json({
      stun_servers: stunServers,
      turn_servers: turnServers,
      turn_configured: Boolean(TURN_CREDENTIALS),
      turn_skipped: ice.skipped,
      turn_error: ice.error ? `TURN_CREDENTIALS inválido: ${ice.error}` : null,
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
