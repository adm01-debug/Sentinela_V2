CREATE UNIQUE INDEX IF NOT EXISTS recording_chunks_session_sequence_key
  ON public.recording_chunks (session_id, sequence);

CREATE INDEX IF NOT EXISTS recording_sessions_status_expires_idx
  ON public.recording_sessions (status, expires_at);

CREATE INDEX IF NOT EXISTS recording_sessions_company_started_idx
  ON public.recording_sessions (company_id, started_at DESC);

INSERT INTO public.data_retention_policies (company_id, data_type, retention_days, is_active)
SELECT NULL, 'recordings', 30, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.data_retention_policies
  WHERE data_type = 'recordings' AND company_id IS NULL
);