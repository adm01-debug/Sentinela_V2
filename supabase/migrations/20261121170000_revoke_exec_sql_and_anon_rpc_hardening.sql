-- Endurece RPCs que aceitam _user_id arbitrario (oraculo de enumeracao)
-- e remove exec_sql (SQL arbitrario) do alcance de anon.
--
-- Causa raiz: as funcoes nasceram com o GRANT EXECUTE default do Postgres
-- para PUBLIC, o que inclui anon. Como sao SECURITY DEFINER, qualquer
-- visitante com a anon key (publica no bundle) lia auth.users via
-- get_user_company_id/user_in_company/has_role e executava SQL arbitrario
-- via exec_sql (SELECT em auth.users retornava emails reais).
--
-- Aplicado em producao em 2026-11-21 via Management API; este arquivo
-- reproduz o mesmo estado para o repo.

revoke execute on function public.exec_sql(text) from anon;
revoke execute on function public.exec_sql(text) from authenticated;
revoke execute on function public.exec_sql(text) from public;

revoke execute on function public.get_user_company_id(uuid) from anon;
revoke execute on function public.get_user_company_id(uuid) from public;

revoke execute on function public.user_in_company(uuid, uuid) from anon;
revoke execute on function public.user_in_company(uuid, uuid) from public;

revoke execute on function public.has_role(uuid, public.app_role) from anon;
revoke execute on function public.has_role(uuid, public.app_role) from public;

revoke execute on function public.log_activity(text, uuid, text, text, jsonb, jsonb) from anon;
revoke execute on function public.log_activity(text, uuid, text, text, jsonb, jsonb) from public;

revoke execute on function public.record_violation_action(uuid, text, text) from anon;
revoke execute on function public.record_violation_action(uuid, text, text) from public;

-- has_role e chamada pelas RLS policies em nome de authenticated: manter.
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.get_user_company_id(uuid) to authenticated, service_role;
grant execute on function public.user_in_company(uuid, uuid) to authenticated, service_role;
grant execute on function public.log_activity(text, uuid, text, text, jsonb, jsonb) to authenticated, service_role;
grant execute on function public.record_violation_action(uuid, text, text) to authenticated, service_role;
grant execute on function public.get_user_permissions(uuid) to authenticated, service_role;
grant execute on function public.has_permission(uuid, text) to authenticated, service_role;