
CREATE TABLE public.slack_notification_dlq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.slack_integrations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('warning','critical','breached')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  url TEXT,
  last_error TEXT NOT NULL,
  last_status INTEGER,
  attempts INTEGER NOT NULL DEFAULT 1,
  permanent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  replayed_at TIMESTAMPTZ,
  replayed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  replay_success BOOLEAN
);

GRANT SELECT, UPDATE, DELETE ON public.slack_notification_dlq TO authenticated;
GRANT ALL ON public.slack_notification_dlq TO service_role;

ALTER TABLE public.slack_notification_dlq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view DLQ"
  ON public.slack_notification_dlq FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update DLQ (replay)"
  ON public.slack_notification_dlq FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete DLQ"
  ON public.slack_notification_dlq FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_slack_dlq_pending ON public.slack_notification_dlq (created_at DESC)
  WHERE replayed_at IS NULL;
CREATE INDEX idx_slack_dlq_integration ON public.slack_notification_dlq (integration_id);
