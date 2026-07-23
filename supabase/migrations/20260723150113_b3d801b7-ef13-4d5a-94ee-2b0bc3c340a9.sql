
ALTER TABLE public.live_view_sessions
  ADD COLUMN IF NOT EXISTS consent_state text NOT NULL DEFAULT 'pending'
    CHECK (consent_state IN ('pending','granted','denied','not_required','timeout')),
  ADD COLUMN IF NOT EXISTS consent_reason text,
  ADD COLUMN IF NOT EXISTS consent_decided_at timestamptz;

-- Backfill baseado em colunas antigas
UPDATE public.live_view_sessions
   SET consent_state = CASE
     WHEN consent_required = false THEN 'not_required'
     WHEN consent_granted = true THEN 'granted'
     WHEN consent_granted = false THEN 'denied'
     ELSE 'pending'
   END
 WHERE consent_state = 'pending';

CREATE INDEX IF NOT EXISTS idx_lvs_consent_state
  ON public.live_view_sessions(consent_state);
