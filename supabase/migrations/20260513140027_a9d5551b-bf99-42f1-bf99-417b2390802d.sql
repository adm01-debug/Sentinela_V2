-- Enable RLS on missing tables
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for WebAuthn (Critical for security)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own challenges' AND tablename = 'webauthn_challenges') THEN
        CREATE POLICY "Users can view their own challenges" ON public.webauthn_challenges
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own credentials' AND tablename = 'webauthn_credentials') THEN
        CREATE POLICY "Users can manage their own credentials" ON public.webauthn_credentials
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Update partition builder to auto-enable RLS
CREATE OR REPLACE FUNCTION public.create_monthly_partition(p_table_name text, p_partition_date date)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    -- NEW: Auto-enable RLS on the new partition
    v_sql := format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_partition_name);
    EXECUTE v_sql;
    
    RETURN v_partition_name;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Enable RLS on existing partitions (Historical fix)
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.schemaname = 'public' 
          AND c.relrowsecurity = false 
          AND (tablename LIKE 'click_logs_partitioned%' 
               OR tablename LIKE 'keystroke_logs_partitioned%' 
               OR tablename LIKE 'mobile_activity_logs_partitioned%' 
               OR tablename LIKE 'productivity_logs_partitioned%')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;