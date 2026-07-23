
CREATE TABLE public.slack_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  event_types TEXT[] NOT NULL DEFAULT ARRAY['dispute_sla_escalation'],
  min_severity TEXT NOT NULL DEFAULT 'critical' CHECK (min_severity IN ('warning','critical','breached')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.slack_integrations TO authenticated;
GRANT ALL ON public.slack_integrations TO service_role;

ALTER TABLE public.slack_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage slack integrations"
  ON public.slack_integrations
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_slack_integrations_updated_at
  BEFORE UPDATE ON public.slack_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_slack_integrations_active ON public.slack_integrations (is_active) WHERE is_active = true;
