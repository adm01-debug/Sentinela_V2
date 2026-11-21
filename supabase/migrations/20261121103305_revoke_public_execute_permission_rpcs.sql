-- Revoga EXECUTE de anon/public nas RPCs de permissao que NAO sao usadas em RLS.
-- has_role ficou de fora: 319 policies dependem dela; revogar quebra SELECT anon.
-- (sp) Objetivo: funcoes SECURITY DEFINER nao expostas a nao autenticados.
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_permissions(uuid) FROM PUBLIC, anon;

-- Authenticated e service_role mantem acesso.
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_permissions(uuid) TO service_role;
