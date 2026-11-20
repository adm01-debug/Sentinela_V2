
-- Harden EXECUTE privileges on SECURITY DEFINER functions.
-- Step 1: revoke public execute on all sensitive functions.

REVOKE EXECUTE ON FUNCTION public.cleanup_expired_webauthn_challenges() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_logs() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_monthly_partition(text, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, text, integer, integer) FROM PUBLIC, anon, authenticated;

-- Policy helpers: allow authenticated (needed for RLS evaluation), revoke anon.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_in_company(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_company_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_permissions(uuid) FROM PUBLIC, anon;

-- Geo/IP helpers: used in edge/RLS paths; keep authenticated only.
REVOKE EXECUTE ON FUNCTION public.get_geo_blocking_info(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_ip_whitelist_info(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_ip_blocked(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_ip_whitelisted(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_country_blocked(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.ip_bypasses_rate_limit(text) FROM PUBLIC, anon;

-- Ensure authenticated retains what it needs (idempotent).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_in_company(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_company_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_geo_blocking_info(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ip_whitelist_info(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_ip_blocked(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_ip_whitelisted(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_country_blocked(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ip_bypasses_rate_limit(text) TO authenticated;

-- Service role retains full access to admin utilities.
GRANT EXECUTE ON FUNCTION public.cleanup_expired_webauthn_challenges() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_logs() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_monthly_partition(text, date) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, text, integer, integer) TO service_role;
