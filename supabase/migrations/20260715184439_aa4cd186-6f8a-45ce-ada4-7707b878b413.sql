-- Hardening: revoke EXECUTE from authenticated/anon on administrative SECURITY DEFINER functions.
-- Functions used inside RLS policies (has_role, has_permission, user_in_company,
-- get_user_company_id, get_user_permissions) MUST remain executable so RLS keeps working.

REVOKE EXECUTE ON FUNCTION public.cleanup_expired_webauthn_challenges() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_logs() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_monthly_partition(text, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_ip_blocked(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_ip_whitelisted(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ip_bypasses_rate_limit(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_ip_whitelist_info(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_country_blocked(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_geo_blocking_info(text) FROM PUBLIC, anon, authenticated;

-- Ensure service_role retains full access for edge functions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_webauthn_challenges() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_logs() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_monthly_partition(text, date) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_ip_blocked(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_ip_whitelisted(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.ip_bypasses_rate_limit(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_ip_whitelist_info(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_country_blocked(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_geo_blocking_info(text) TO service_role;