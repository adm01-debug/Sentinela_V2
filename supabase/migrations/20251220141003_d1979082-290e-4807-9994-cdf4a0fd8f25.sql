-- ============================================================
-- FIX SECURITY ISSUES: RLS on partitions and SECURITY INVOKER views
-- ============================================================

-- 1. Enable RLS on all partition tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND (
      tablename LIKE 'keystroke_logs_partitioned_%'
      OR tablename LIKE 'click_logs_partitioned_%'
      OR tablename LIKE 'productivity_logs_partitioned_%'
      OR tablename LIKE 'mobile_activity_logs_partitioned_%'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END;
$$;

-- 2. Drop and recreate views with SECURITY INVOKER (default, no SECURITY DEFINER)
DROP VIEW IF EXISTS public.all_keystroke_logs;
DROP VIEW IF EXISTS public.all_click_logs;
DROP VIEW IF EXISTS public.all_productivity_logs;
DROP VIEW IF EXISTS public.all_mobile_activity_logs;

CREATE VIEW public.all_keystroke_logs 
WITH (security_invoker = true)
AS
SELECT id, employee_name, keystrokes_count, active_time_seconds, idle_time_seconds, 
       app_name, device, recorded_at, created_at
FROM public.keystroke_logs
UNION ALL
SELECT id, employee_name, keystrokes_count, active_time_seconds, idle_time_seconds, 
       app_name, device, recorded_at, created_at
FROM public.keystroke_logs_partitioned;

CREATE VIEW public.all_click_logs 
WITH (security_invoker = true)
AS
SELECT id, employee_name, click_type, x_position, y_position, target_element,
       url, window_title, app_name, device, recorded_at, created_at
FROM public.click_logs
UNION ALL
SELECT id, employee_name, click_type, x_position, y_position, target_element,
       url, window_title, app_name, device, recorded_at, created_at
FROM public.click_logs_partitioned;

CREATE VIEW public.all_productivity_logs 
WITH (security_invoker = true)
AS
SELECT id, employee_name, productive_time_seconds, unproductive_time_seconds, 
       neutral_time_seconds, apps_used, device, recorded_date, created_at
FROM public.productivity_logs
UNION ALL
SELECT id, employee_name, productive_time_seconds, unproductive_time_seconds, 
       neutral_time_seconds, apps_used, device, recorded_date, created_at
FROM public.productivity_logs_partitioned;

CREATE VIEW public.all_mobile_activity_logs 
WITH (security_invoker = true)
AS
SELECT id, employee_name, activity_type, app_name, duration_seconds,
       latitude, longitude, device_id, metadata, recorded_at, created_at
FROM public.mobile_activity_logs
UNION ALL
SELECT id, employee_name, activity_type, app_name, duration_seconds,
       latitude, longitude, device_id, metadata, recorded_at, created_at
FROM public.mobile_activity_logs_partitioned;