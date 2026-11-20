
REVOKE EXECUTE ON FUNCTION public.sync_violation_dispute_status() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_violation_dispute_status() TO service_role;
