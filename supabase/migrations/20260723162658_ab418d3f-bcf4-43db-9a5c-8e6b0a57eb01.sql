ALTER TABLE public.slack_integrations
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_slack_integrations_company
  ON public.slack_integrations(company_id) WHERE company_id IS NOT NULL;