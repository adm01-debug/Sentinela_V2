CREATE TABLE IF NOT EXISTS public.error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  stack TEXT,
  component TEXT,
  context JSONB,
  severity TEXT NOT NULL DEFAULT 'medium',
  url TEXT,
  user_agent TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert error reports"
  ON public.error_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view error reports"
  ON public.error_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_error_reports_severity ON public.error_reports (severity);
CREATE INDEX idx_error_reports_occurred_at ON public.error_reports (occurred_at DESC);