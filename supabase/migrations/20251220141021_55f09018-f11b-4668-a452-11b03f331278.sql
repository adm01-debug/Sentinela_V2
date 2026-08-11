-- ============================================================
-- ADD RLS POLICIES TO PARTITION TABLES
-- ============================================================

-- Policies for keystroke_logs partitions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE 'keystroke_logs_partitioned_%'
  LOOP
    EXECUTE format('
      CREATE POLICY "Admins can view %I" ON public.%I FOR SELECT USING (has_role(auth.uid(), ''admin''::app_role));
      CREATE POLICY "Admins can insert %I" ON public.%I FOR INSERT WITH CHECK (has_role(auth.uid(), ''admin''::app_role));
    ', r.tablename, r.tablename, r.tablename, r.tablename);
  END LOOP;
END;
$$;

-- Policies for click_logs partitions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE 'click_logs_partitioned_%'
  LOOP
    EXECUTE format('
      CREATE POLICY "Admins can view %I" ON public.%I FOR SELECT USING (has_role(auth.uid(), ''admin''::app_role));
      CREATE POLICY "Admins can insert %I" ON public.%I FOR INSERT WITH CHECK (has_role(auth.uid(), ''admin''::app_role));
    ', r.tablename, r.tablename, r.tablename, r.tablename);
  END LOOP;
END;
$$;

-- Policies for productivity_logs partitions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE 'productivity_logs_partitioned_%'
  LOOP
    EXECUTE format('
      CREATE POLICY "Admins can view %I" ON public.%I FOR SELECT USING (has_role(auth.uid(), ''admin''::app_role));
      CREATE POLICY "Admins can insert %I" ON public.%I FOR INSERT WITH CHECK (has_role(auth.uid(), ''admin''::app_role));
    ', r.tablename, r.tablename, r.tablename, r.tablename);
  END LOOP;
END;
$$;

-- Policies for mobile_activity_logs partitions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE 'mobile_activity_logs_partitioned_%'
  LOOP
    EXECUTE format('
      CREATE POLICY "Admins can view %I" ON public.%I FOR SELECT USING (has_role(auth.uid(), ''admin''::app_role));
      CREATE POLICY "Admins can insert %I" ON public.%I FOR INSERT WITH CHECK (has_role(auth.uid(), ''admin''::app_role));
    ', r.tablename, r.tablename, r.tablename, r.tablename);
  END LOOP;
END;
$$;

-- RLS for companies and user_companies (fix from previous migration)
CREATE POLICY "Admins can insert companies"
ON public.companies
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete companies"
ON public.companies
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));