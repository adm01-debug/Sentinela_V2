
CREATE TABLE public.slack_delivery_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.slack_integrations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT,
  success BOOLEAN NOT NULL,
  status_code INTEGER,
  attempts INTEGER NOT NULL DEFAULT 1,
  duration_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_slack_delivery_events_integration_created
  ON public.slack_delivery_events (integration_id, created_at DESC);
CREATE INDEX idx_slack_delivery_events_created
  ON public.slack_delivery_events (created_at DESC);

GRANT SELECT ON public.slack_delivery_events TO authenticated;
GRANT ALL ON public.slack_delivery_events TO service_role;

ALTER TABLE public.slack_delivery_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view slack delivery events"
  ON public.slack_delivery_events
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (company_id IS NOT NULL AND public.user_in_company(auth.uid(), company_id))
  );

CREATE POLICY "Service role inserts slack delivery events"
  ON public.slack_delivery_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);
