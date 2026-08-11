-- ============================================================
-- MONTHLY PARTITIONING FOR ACTIVITY LOGS
-- ============================================================

-- 1. Create partitioned keystroke_logs table
CREATE TABLE public.keystroke_logs_partitioned (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  keystrokes_count INTEGER NOT NULL DEFAULT 0,
  active_time_seconds INTEGER NOT NULL DEFAULT 0,
  idle_time_seconds INTEGER NOT NULL DEFAULT 0,
  app_name TEXT,
  device TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- 2. Create partitioned click_logs table
CREATE TABLE public.click_logs_partitioned (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  click_type TEXT NOT NULL DEFAULT 'left',
  x_position INTEGER,
  y_position INTEGER,
  target_element TEXT,
  url TEXT,
  window_title TEXT,
  app_name TEXT,
  device TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- 3. Create partitioned productivity_logs table
CREATE TABLE public.productivity_logs_partitioned (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  productive_time_seconds INTEGER NOT NULL DEFAULT 0,
  unproductive_time_seconds INTEGER NOT NULL DEFAULT 0,
  neutral_time_seconds INTEGER NOT NULL DEFAULT 0,
  apps_used JSONB DEFAULT '[]'::jsonb,
  device TEXT,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id, recorded_date)
) PARTITION BY RANGE (recorded_date);

-- 4. Create partitioned mobile_activity_logs table
CREATE TABLE public.mobile_activity_logs_partitioned (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  app_name TEXT,
  duration_seconds INTEGER,
  latitude NUMERIC,
  longitude NUMERIC,
  device_id UUID,
  metadata JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- 5. Create function to auto-create partitions
CREATE OR REPLACE FUNCTION public.create_monthly_partition(
  p_table_name TEXT,
  p_partition_date DATE
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partition_name TEXT;
  v_start_date DATE;
  v_end_date DATE;
  v_sql TEXT;
BEGIN
  v_start_date := date_trunc('month', p_partition_date)::DATE;
  v_end_date := (v_start_date + INTERVAL '1 month')::DATE;
  v_partition_name := p_table_name || '_' || to_char(v_start_date, 'YYYY_MM');
  
  -- Check if partition exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = v_partition_name
  ) THEN
    v_sql := format(
      'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.%I FOR VALUES FROM (%L) TO (%L)',
      v_partition_name,
      p_table_name,
      v_start_date,
      v_end_date
    );
    EXECUTE v_sql;
    RETURN v_partition_name;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 6. Create partitions for current and next 3 months
DO $$
DECLARE
  v_date DATE;
  v_tables TEXT[] := ARRAY['keystroke_logs_partitioned', 'click_logs_partitioned', 'mobile_activity_logs_partitioned'];
  v_table TEXT;
BEGIN
  FOR i IN 0..3 LOOP
    v_date := (CURRENT_DATE + (i || ' months')::INTERVAL)::DATE;
    FOREACH v_table IN ARRAY v_tables LOOP
      PERFORM public.create_monthly_partition(v_table, v_date);
    END LOOP;
  END LOOP;
END;
$$;

-- 7. Create partitions for productivity_logs (uses recorded_date)
DO $$
DECLARE
  v_date DATE;
BEGIN
  FOR i IN 0..3 LOOP
    v_date := (CURRENT_DATE + (i || ' months')::INTERVAL)::DATE;
    PERFORM public.create_monthly_partition('productivity_logs_partitioned', v_date);
  END LOOP;
END;
$$;

-- 8. Create indexes on partitioned tables
CREATE INDEX idx_keystroke_logs_part_employee ON public.keystroke_logs_partitioned(employee_name);
CREATE INDEX idx_keystroke_logs_part_recorded ON public.keystroke_logs_partitioned(recorded_at);
CREATE INDEX idx_click_logs_part_employee ON public.click_logs_partitioned(employee_name);
CREATE INDEX idx_click_logs_part_recorded ON public.click_logs_partitioned(recorded_at);
CREATE INDEX idx_productivity_logs_part_employee ON public.productivity_logs_partitioned(employee_name);
CREATE INDEX idx_productivity_logs_part_date ON public.productivity_logs_partitioned(recorded_date);
CREATE INDEX idx_mobile_activity_part_employee ON public.mobile_activity_logs_partitioned(employee_name);
CREATE INDEX idx_mobile_activity_part_recorded ON public.mobile_activity_logs_partitioned(recorded_at);

-- 9. Enable RLS on partitioned tables
ALTER TABLE public.keystroke_logs_partitioned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_logs_partitioned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_logs_partitioned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_activity_logs_partitioned ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
CREATE POLICY "Admins can view keystroke logs partitioned"
ON public.keystroke_logs_partitioned FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert keystroke logs partitioned"
ON public.keystroke_logs_partitioned FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view click logs partitioned"
ON public.click_logs_partitioned FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert click logs partitioned"
ON public.click_logs_partitioned FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view productivity logs partitioned"
ON public.productivity_logs_partitioned FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert productivity logs partitioned"
ON public.productivity_logs_partitioned FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view mobile activity logs partitioned"
ON public.mobile_activity_logs_partitioned FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert mobile activity logs partitioned"
ON public.mobile_activity_logs_partitioned FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 11. Create view to unify old and new tables
CREATE OR REPLACE VIEW public.all_keystroke_logs AS
SELECT id, employee_name, keystrokes_count, active_time_seconds, idle_time_seconds, 
       app_name, device, recorded_at, created_at
FROM public.keystroke_logs
UNION ALL
SELECT id, employee_name, keystrokes_count, active_time_seconds, idle_time_seconds, 
       app_name, device, recorded_at, created_at
FROM public.keystroke_logs_partitioned;

CREATE OR REPLACE VIEW public.all_click_logs AS
SELECT id, employee_name, click_type, x_position, y_position, target_element,
       url, window_title, app_name, device, recorded_at, created_at
FROM public.click_logs
UNION ALL
SELECT id, employee_name, click_type, x_position, y_position, target_element,
       url, window_title, app_name, device, recorded_at, created_at
FROM public.click_logs_partitioned;

CREATE OR REPLACE VIEW public.all_productivity_logs AS
SELECT id, employee_name, productive_time_seconds, unproductive_time_seconds, 
       neutral_time_seconds, apps_used, device, recorded_date, created_at
FROM public.productivity_logs
UNION ALL
SELECT id, employee_name, productive_time_seconds, unproductive_time_seconds, 
       neutral_time_seconds, apps_used, device, recorded_date, created_at
FROM public.productivity_logs_partitioned;

CREATE OR REPLACE VIEW public.all_mobile_activity_logs AS
SELECT id, employee_name, activity_type, app_name, duration_seconds,
       latitude, longitude, device_id, metadata, recorded_at, created_at
FROM public.mobile_activity_logs
UNION ALL
SELECT id, employee_name, activity_type, app_name, duration_seconds,
       latitude, longitude, device_id, metadata, recorded_at, created_at
FROM public.mobile_activity_logs_partitioned;