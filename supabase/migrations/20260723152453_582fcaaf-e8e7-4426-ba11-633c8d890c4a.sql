
CREATE TABLE public.violation_disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  violation_id UUID NOT NULL REFERENCES public.security_violations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitter_type TEXT NOT NULL DEFAULT 'employee' CHECK (submitter_type IN ('employee','manager','admin')),
  reason TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('false_positive','misclassified','context_missing','policy_unclear','technical_error','other')),
  evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected','withdrawn')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  signature_sha256 TEXT,
  submitter_ip TEXT,
  submitter_device TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_violation_disputes_violation ON public.violation_disputes(violation_id);
CREATE INDEX idx_violation_disputes_company_status ON public.violation_disputes(company_id, status);
CREATE INDEX idx_violation_disputes_employee ON public.violation_disputes(employee_name);
CREATE INDEX idx_violation_disputes_created ON public.violation_disputes(created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.violation_disputes TO authenticated;
GRANT ALL ON public.violation_disputes TO service_role;

ALTER TABLE public.violation_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view disputes"
ON public.violation_disputes FOR SELECT TO authenticated
USING (public.user_in_company(auth.uid(), company_id));

CREATE POLICY "Company members can create disputes"
ON public.violation_disputes FOR INSERT TO authenticated
WITH CHECK (public.user_in_company(auth.uid(), company_id));

CREATE POLICY "Admins can update disputes"
ON public.violation_disputes FOR UPDATE TO authenticated
USING (public.user_in_company(auth.uid(), company_id) AND public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_violation_disputes_updated_at
BEFORE UPDATE ON public.violation_disputes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.security_violations
  ADD COLUMN IF NOT EXISTS dispute_status TEXT
  CHECK (dispute_status IS NULL OR dispute_status IN ('pending','under_review','approved','rejected','withdrawn'));

CREATE INDEX IF NOT EXISTS idx_security_violations_dispute_status
  ON public.security_violations(dispute_status)
  WHERE dispute_status IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_violation_dispute_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.security_violations
  SET dispute_status = NEW.status
  WHERE id = NEW.violation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_violation_dispute_status
AFTER INSERT OR UPDATE OF status ON public.violation_disputes
FOR EACH ROW EXECUTE FUNCTION public.sync_violation_dispute_status();
