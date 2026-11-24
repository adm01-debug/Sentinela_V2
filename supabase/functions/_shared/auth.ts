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
 *  - a service_role key (invocacao server-to-server, cron/pg_net); ou
 *  - um JWT de usuario valido (front com sessao).
 * Qualquer outro token, incluindo a chave publicavel, lanca erro.
 *
 * A service_role nao pode ser reconhecida so por comparacao com
 * SUPABASE_SERVICE_ROLE_KEY: em projeto com o novo sistema de API keys o
 * runtime recebe a secret key (`sb_secret_...`), que nao e o JWT legacy
 * devolvido pela Management API. Por isso o token desconhecido e validado
 * contra a API admin do GoTrue, que so aceita service_role.
 */
export async function requireUserOrServiceRole(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const apiKey = req.headers.get('apikey') ?? '';
  // Caminho rapido: o chamador server-to-server le o mesmo env, entao o valor
  // bate sem roundtrip extra.
  if (serviceRoleKey && (token === serviceRoleKey || apiKey === serviceRoleKey)) {
    return { user: null, isServiceRole: true };
  }

  if (!token) {
    throw new Error('Missing authorization header');
  }

  const url = Deno.env.get('SUPABASE_URL') ?? '';

  const userClient = createClient(url, apiKey || (Deno.env.get('SUPABASE_ANON_KEY') ?? ''), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user } } = await userClient.auth.getUser(token);
  if (user) {
    return { user, isServiceRole: false };
  }

  // A API admin do GoTrue so responde com service_role (JWT legacy ou secret
  // key): sucesso aqui prova a credencial, sem depender do formato da chave.
  const adminProbe = createClient(url, token, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: adminError } = await adminProbe.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (!adminError) {
    return { user: null, isServiceRole: true };
  }

  throw new Error('Invalid token');
}

/**
 * Gate para funcoes que o pg_cron chama diretamente.
 *
 * O job criado no painel chama a funcao com a anon key e o gateway aceita por
 * verify_jwt, entao a prova de identidade e o header x-cron-secret, cujo valor
 * mora em public.cron_secrets (RLS sem policy: so service_role le). O job
 * recebe o header pela migration que re-agenda o cron.
 *
 * Enquanto a tabela/linha nao existir (migration pendente) o comportamento
 * anterior e mantido, para o deploy da funcao poder chegar antes do DDL sem
 * derrubar o job por 401.
 */
export async function requireCronOrServiceRole(req: Request, cronName: string) {
  const provided = req.headers.get('x-cron-secret') ?? '';
  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await admin
    .from('cron_secrets')
    .select('secret')
    .eq('name', cronName)
    .maybeSingle();

  const expected = typeof data?.secret === 'string' ? data.secret : '';
  if (error || !expected) return { cron: false, isServiceRole: false };

  if (provided && provided === expected) return { cron: true, isServiceRole: false };

  return requireUserOrServiceRole(req);
}
