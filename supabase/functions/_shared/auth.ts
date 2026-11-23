import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing authorization header');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error('Invalid token');
  }
  
  return user;
}

/**
 * Gate para funcoes publicadas com verify_jwt = false.
 *
 * O gateway do Supabase aceita a chave publicavel (apikey) no header
 * Authorization, entao verify_jwt = true nao prova que existe um usuario
 * logado. Aqui so passam:
 *  - a service_role key (invocacao server-to-server, cron/pg_net), que o
 *    createClient(SUPABASE_SERVICE_ROLE_KEY) do supabase-js envia sozinho; ou
 *  - um JWT de usuario valido (front com sessao).
 * Qualquer outro token, incluindo a chave publicavel, lanca erro.
 */
export async function requireUserOrServiceRole(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const apiKey = req.headers.get('apikey') ?? '';
  // O supabase-js manda a chave do client nos dois headers; aceitar os dois
  // garante que a chamada server-to-server (service_role) nunca seja barrada.
  if (serviceRoleKey && (token === serviceRoleKey || apiKey === serviceRoleKey)) {
    return { user: null, isServiceRole: true };
  }

  if (!token) {
    throw new Error('Missing authorization header');
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    apiKey || (Deno.env.get('SUPABASE_ANON_KEY') ?? ''),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error('Invalid token');
  }

  return { user, isServiceRole: false };
}
