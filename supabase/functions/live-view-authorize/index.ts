import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const TURN_CREDENTIALS = Deno.env.get('TURN_CREDENTIALS'); // optional JSON

interface AuthorizePayload {
  agent_id: string;
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'unauthorized' }, 401);
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) return json({ error: 'unauthorized' }, 401);
    const user = userRes.user;

    const body = (await req.json().catch(() => ({}))) as AuthorizePayload;
    if (!body.agent_id || typeof body.agent_id !== 'string') {
      return json({ error: 'agent_id required' }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Look up agent + company
    const { data: agent, error: agentErr } = await admin
      .from('agent_keys')
      .select('id, company_id, last_seen_at, is_active')
      .eq('id', body.agent_id)
      .maybeSingle();
    if (agentErr || !agent) return json({ error: 'agent_not_found' }, 404);
    if (!agent.is_active) return json({ error: 'agent_inactive' }, 409);

    // Verify admin role + same company
    const [{ data: hasRole }, { data: inCompany }] = await Promise.all([
      admin.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
      admin.rpc('user_in_company', { _user_id: user.id, _company_id: agent.company_id }),
    ]);
    if (!hasRole || !inCompany) return json({ error: 'forbidden' }, 403);

    // Rate limit: max 3 active sessions per admin, 1 per agent
    const { count: perAdmin } = await admin
      .from('live_view_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('requested_by', user.id)
      .in('status', ['pending', 'active']);
    if ((perAdmin ?? 0) >= 3) return json({ error: 'rate_limit_admin' }, 429);

    const { count: perAgent } = await admin
      .from('live_view_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('agent_id', agent.id)
      .in('status', ['pending', 'active']);
    if ((perAgent ?? 0) >= 1) return json({ error: 'agent_busy' }, 409);

    // Agent online check (last_seen_at < 60s)
    const lastSeen = agent.last_seen_at ? new Date(agent.last_seen_at).getTime() : 0;
    const online = Date.now() - lastSeen < 60_000;
    if (!online) return json({ error: 'agent_offline' }, 409);

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const ua = req.headers.get('user-agent') ?? null;

    const { data: session, error: sErr } = await admin
      .from('live_view_sessions')
      .insert({
        agent_id: agent.id,
        company_id: agent.company_id,
        requested_by: user.id,
        status: 'pending',
        ip,
        user_agent: ua,
      })
      .select()
      .single();
    if (sErr || !session) return json({ error: 'session_create_failed', detail: sErr?.message }, 500);

    await admin.from('live_view_audit').insert({
      session_id: session.id,
      company_id: agent.company_id,
      event: 'session.authorized',
      payload: { requested_by: user.id, reason: body.reason ?? null, ip, ua },
    });

    const iceServers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];
    if (TURN_CREDENTIALS) {
      try {
        const parsed = JSON.parse(TURN_CREDENTIALS);
        if (Array.isArray(parsed)) iceServers.push(...parsed);
      } catch (_) {
        // ignore malformed TURN config
      }
    }

    return json({
      session_id: session.id,
      channel: `live-view:${agent.id}`,
      ice_servers: iceServers,
      expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
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

// Deno type shim
declare const RTCIceServer: unknown;
