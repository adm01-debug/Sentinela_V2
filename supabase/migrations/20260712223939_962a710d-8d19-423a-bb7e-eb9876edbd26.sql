
ALTER TABLE public.security_violations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','investigating','resolved','dismissed')),
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_by UUID;

-- Migra estado histórico: violações já lidas viram "resolved"
UPDATE public.security_violations
   SET status = 'resolved',
       resolved_at = COALESCE(resolved_at, created_at)
 WHERE read = true AND status = 'open';

CREATE INDEX IF NOT EXISTS idx_security_violations_status
  ON public.security_violations (status);
