
-- ============================================================
-- P0.1: Add admin-only RLS policies on newer partition children
-- Mirrors parent-table policies to satisfy linter and block
-- direct API access to partition children.
-- ============================================================

DO $$
DECLARE
  t TEXT;
  parts TEXT[] := ARRAY[
    'click_logs_partitioned_2026_06','click_logs_partitioned_2026_07',
    'keystroke_logs_partitioned_2026_06','keystroke_logs_partitioned_2026_07',
    'mobile_activity_logs_partitioned_2026_06','mobile_activity_logs_partitioned_2026_07',
    'productivity_logs_partitioned_2026_06','productivity_logs_partitioned_2026_07'
  ];
BEGIN
  FOREACH t IN ARRAY parts LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "Admins can view %I" ON public.%I',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY "Admins can view %I" ON public.%I FOR SELECT USING (public.has_role(auth.uid(), ''admin''::app_role))',
      t, t
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS "Admins can insert %I" ON public.%I',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY "Admins can insert %I" ON public.%I FOR INSERT WITH CHECK (public.has_role(auth.uid(), ''admin''::app_role))',
      t, t
    );
  END LOOP;
END $$;

-- ============================================================
-- P0.2: Revoke EXECUTE from `authenticated` on admin-only
-- SECURITY DEFINER maintenance functions.
-- These are called only by cron / edge functions using
-- service_role, so authenticated users have no legitimate need.
-- Helper functions used inside RLS policies (has_role,
-- has_permission, user_in_company, is_ip_blocked, etc.) are
-- intentionally left executable — revoking would break RLS.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_logs() FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_webauthn_challenges() FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.create_monthly_partition(text, date) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, text, integer, integer) FROM authenticated, anon;
