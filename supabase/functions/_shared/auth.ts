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
 * Gate estrito para funcoes sem chamador no produto (nem front, nem cron, nem
 * workflow).
 *
 * Só passa service_role. Um JWT de usuario logado tambem e recusado de
 * proposito: nada menos que a credencial de servidor deve alcancar funcoes
 * que escrevem com service_role (ex.: UPDATE em tabela arbitraria), e a chave
 * publicavel embutida no bundle do front nao pode servir de credencial.
 */
export async function requireServiceRole(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const apiKey = req.headers.get('apikey') ?? '';

  if (serviceRoleKey && (token === serviceRoleKey || apiKey === serviceRoleKey)) {
    return { isServiceRole: true };
  }

  if (token) {
    // Em projeto com o novo sistema de API keys o runtime recebe a secret key
    // (`sb_secret_...`), que nao bate com o JWT legacy lido do env: a prova tem
    // de ser a API admin do GoTrue, que so responde a service_role.
    const adminProbe = createClient(Deno.env.get('SUPABASE_URL') ?? '', token, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await adminProbe.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!error) {
      return { isServiceRole: true };
    }
  }

  throw new Error('Service role required');
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

/**
 * Filtro PostgREST que reproduz a policy de tenant das tabelas com company_id:
 * `company_id IS NULL OR company_id = get_user_company_id(auth.uid())`.
 *
 * Consulta feita com service_role ignora RLS, entao sem este filtro uma edge de
 * analise devolve dados de todas as empresas.
 */
export function companyScope(companyId: string | null | undefined): string {
  return companyId ? `company_id.is.null,company_id.eq.${companyId}` : 'company_id.is.null';
}

/**
 * Escopo de tenant do chamador: a company dele, ou null quando o chamador e a
 * service_role (interno/cron, que ja e confiavel e pode varrer todas).
 */
export async function callerCompanyScope(
  admin: {
    rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<{ data?: unknown }>;
  },
  ctx: { user: { id: string } | null; isServiceRole: boolean },
): Promise<string | null> {
  if (ctx.isServiceRole || !ctx.user) return null;

  const { data } = await admin.rpc('get_user_company_id', { _user_id: ctx.user.id });

  return companyScope(data as string | null);
}

/**
 * Aplica o escopo de tenant em consultas feitas com service_role. Sem escopo
 * (chamador interno) devolve a consulta intacta.
 */
export function withCompanyScope<T>(query: T, scope: string | null): T {
  if (!scope) return query;

  return (query as unknown as { or: (filter: string) => T }).or(scope);
}
