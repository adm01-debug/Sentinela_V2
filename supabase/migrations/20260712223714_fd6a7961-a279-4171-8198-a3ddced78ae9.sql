
CREATE INDEX IF NOT EXISTS idx_productivity_logs_recorded_date
  ON public.productivity_logs (recorded_date DESC);

CREATE INDEX IF NOT EXISTS idx_productivity_logs_employee_date
  ON public.productivity_logs (employee_name, recorded_date DESC);

CREATE INDEX IF NOT EXISTS idx_security_violations_created_at
  ON public.security_violations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_violations_read
  ON public.security_violations (read) WHERE read = false;
