-- ============================================================
-- ENDURECIMENTO: funcoes de TRIGGER e helpers de geo expostos a anon
-- public.auto_log_activity() e public.enqueue_siem_event() sao
-- SECURITY DEFINER e RETURNS trigger: so fazem sentido disparadas por
-- trigger, mas estavam EXECUTE para anon/authenticated (o default do
-- Postgres concede EXECUTE a PUBLIC). Chamar por PostgREST retorna erro
-- de tipo, mas a superficie de ataque desnecessaria fica aberta.
-- get_geo_blocking_info/is_country_blocked leem geo_blocking_settings,
-- tabela administrativa, e nao sao usadas por nenhuma policy.
-- Revoga EXECUTE de anon e authenticated; triggers continuam
-- funcionando (executam como owner da tabela).
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.auto_log_activity() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_siem_event() FROM anon, authenticated, PUBLIC;

-- helpers de geo: apenas usuarios autenticados
REVOKE EXECUTE ON FUNCTION public.get_geo_blocking_info(text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_country_blocked(text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_geo_blocking_info(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_country_blocked(text) TO authenticated;

-- funcoes de trigger restantes que ainda ficaram EXECUTE para anon
-- cleanup_old_activity_logs(p_days_to_keep integer) e chamada pelo cron
REVOKE EXECUTE ON FUNCTION public.cleanup_old_activity_logs(integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_entity_version() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_single_default_filter() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_sensitive_keywords_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_roles_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_saved_filters_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_violation_comment_updated_at() FROM anon, authenticated, PUBLIC;
