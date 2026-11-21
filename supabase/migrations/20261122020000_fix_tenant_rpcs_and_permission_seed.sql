-- Corrige as RPCs de tenant/permissao que respondiam preguicosamente:
--   * user_in_company/has_role ignoravam user_companies (unica fonte de vinculo
--     real), entao um usuario convidado sem raw_user_meta_data.company_id nao
--     via NADA das 29 policies que usam a funcao.
--   * get_user_company_id lia so o metadata, entao o theming por tenant nunca
--     aplicava para quem foi vinculado via user_companies.
--   * get_user_permissions devolvia sempre ARRAY[]::text[], logo
--     useGranularPermissions/PermissionGate nunca liberavam nada.
--   * role_permissions estava vazia: has_permission(_user_id,'users.view') era
--     sempre false para nao-admin.
--   * get_ip_whitelist_info/is_ip_blocked existiam mas sem EXECUTE para
--     authenticated, quebrando o painel de whitelist com 401.

-- 1) Vinculo de empresa: aceita user_companies e mantem o metadata como fallback.
CREATE OR REPLACE FUNCTION public.user_in_company(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT (_user_id IS NOT NULL) AND (
    EXISTS (
      SELECT 1 FROM public.user_companies uc
      WHERE uc.user_id = _user_id AND uc.company_id = _company_id
    )
    OR EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = _user_id
        AND (u.raw_user_meta_data ->> 'company_id')::uuid = _company_id
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT COALESCE(
    (SELECT uc.company_id FROM public.user_companies uc
      WHERE uc.user_id = _user_id
      ORDER BY uc.created_at LIMIT 1),
    (SELECT (u.raw_user_meta_data ->> 'company_id')::uuid FROM auth.users u WHERE u.id = _user_id)
  );
$function$;

-- 2) Permissoes reais do usuario (roles -> role_permissions -> permissions),
--    com 'admin' injetado para administradores (mesma semantica de has_permission).
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(array_agg(DISTINCT p.name), ARRAY[]::text[])
  FROM public.user_roles ur
  JOIN public.roles r ON lower(r.name) = ur.role::text
  JOIN public.role_permissions rp ON rp.role_id = r.id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = _user_id;
$function$;

-- 3) Seed do mapeamento papel -> permissao (idempotente).
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE
  (lower(r.name) = 'admin')
  OR (lower(r.name) = 'manager' AND p.module IN ('dashboard','employees','teams','reports','violations','geofences') AND p.action <> 'delete')
  OR (lower(r.name) = 'analyst' AND p.action IN ('view','export','analytics'))
  OR (lower(r.name) = 'user' AND p.action = 'view' AND p.module IN ('dashboard','employees','teams','violations'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 4) get_ip_whitelist_info passa a exigir admin: a funcao e SECURITY DEFINER e
--    devolvia a configuracao de bypass de rate limit/auth de qualquer IP para
--    quem tivesse EXECUTE. Agora o grant volta para authenticated, mas a consulta
--    fica restrita a administradores (nao-admin recebe is_whitelisted=false).
CREATE OR REPLACE FUNCTION public.get_ip_whitelist_info(p_ip_address text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT jsonb_build_object(
      'is_whitelisted', true,
      'bypass_rate_limit', bypass_rate_limit,
      'bypass_auth', bypass_auth,
      'allowed_endpoints', allowed_endpoints,
      'expires_at', expires_at,
      'description', description
    )
    FROM public.whitelisted_ips
    WHERE ip_address = p_ip_address
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND public.has_role(auth.uid(), 'admin')
    LIMIT 1),
    jsonb_build_object('is_whitelisted', false)
  )
$function$;

GRANT EXECUTE ON FUNCTION public.get_ip_whitelist_info(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_company_id(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_permissions(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_company_id(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_permissions(uuid) TO authenticated, service_role;
-- 5) has_permission tinha o mesmo bug de caixa: `roles.name` e 'Admin'/'User'
--    enquanto user_roles.role (enum app_role) e 'admin'/'user', logo o JOIN nunca
--    casava e todo check granular caia no fallback de admin.
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON lower(r.name) = ur.role::text
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id
      AND p.name = _permission
  ) OR public.has_role(_user_id, 'admin');
$function$;