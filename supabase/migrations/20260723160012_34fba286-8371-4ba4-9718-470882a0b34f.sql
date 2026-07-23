
ALTER TABLE public.slack_integrations
  ADD COLUMN IF NOT EXISTS auto_pause_threshold INTEGER NOT NULL DEFAULT 5 CHECK (auto_pause_threshold >= 1 AND auto_pause_threshold <= 100),
  ADD COLUMN IF NOT EXISTS auto_paused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_pause_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_slack_integrations_active_paused
  ON public.slack_integrations (is_active, auto_paused_at);
