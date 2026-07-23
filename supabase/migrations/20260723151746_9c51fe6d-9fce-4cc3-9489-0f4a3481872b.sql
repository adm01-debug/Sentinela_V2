
ALTER TABLE public.security_violations
  ADD COLUMN IF NOT EXISTS employee_notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS employee_acknowledged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS employee_ack_reason TEXT,
  ADD COLUMN IF NOT EXISTS employee_ack_signature TEXT,
  ADD COLUMN IF NOT EXISTS employee_ack_ip TEXT,
  ADD COLUMN IF NOT EXISTS employee_ack_device TEXT;

CREATE INDEX IF NOT EXISTS idx_security_violations_employee_ack
  ON public.security_violations (employee_acknowledged_at)
  WHERE employee_acknowledged_at IS NULL;
