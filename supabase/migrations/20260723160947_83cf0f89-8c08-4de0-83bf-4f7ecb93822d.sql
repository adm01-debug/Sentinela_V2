
REVOKE EXECUTE ON FUNCTION public.cleanup_slack_dlq_old_items() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_slack_dlq_old_items() TO service_role, postgres;
