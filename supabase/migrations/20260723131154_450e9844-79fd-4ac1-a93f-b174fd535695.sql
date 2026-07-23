
CREATE TABLE public.report_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT NOT NULL UNIQUE,
  report_type TEXT NOT NULL DEFAULT 'violations',
  signature TEXT NOT NULL,
  payload JSONB NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 0,
  period_label TEXT,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_signatures_report_id ON public.report_signatures(report_id);
CREATE INDEX idx_report_signatures_signature ON public.report_signatures(signature);
CREATE INDEX idx_report_signatures_generated_by ON public.report_signatures(generated_by);

GRANT SELECT, INSERT ON public.report_signatures TO authenticated;
GRANT ALL ON public.report_signatures TO service_role;

ALTER TABLE public.report_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can verify by report_id/signature"
  ON public.report_signatures FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users insert their own signatures"
  ON public.report_signatures FOR INSERT TO authenticated
  WITH CHECK (generated_by = auth.uid());
