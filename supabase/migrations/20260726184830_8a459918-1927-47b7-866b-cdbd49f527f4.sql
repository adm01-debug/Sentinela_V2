
-- =========================================================
-- FASE 1: Gravação de sessão e playback histórico
-- =========================================================

CREATE TABLE public.recording_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  device TEXT,
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  total_bytes BIGINT NOT NULL DEFAULT 0,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'recording' CHECK (status IN ('recording','completed','failed','expired')),
  reason TEXT,
  authorized_by UUID,
  consent_acknowledged BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  error_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recording_sessions TO authenticated;
GRANT ALL ON public.recording_sessions TO service_role;
ALTER TABLE public.recording_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recording_sessions_select_company"
  ON public.recording_sessions FOR SELECT TO authenticated
  USING (company_id IS NULL OR public.user_in_company(auth.uid(), company_id));

CREATE POLICY "recording_sessions_admin_write"
  ON public.recording_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_recording_sessions_company_started
  ON public.recording_sessions (company_id, started_at DESC);
CREATE INDEX idx_recording_sessions_employee
  ON public.recording_sessions (employee_id, started_at DESC);
CREATE INDEX idx_recording_sessions_employee_name
  ON public.recording_sessions (employee_name);
CREATE INDEX idx_recording_sessions_status
  ON public.recording_sessions (status) WHERE status = 'recording';
CREATE INDEX idx_recording_sessions_expires
  ON public.recording_sessions (expires_at) WHERE expires_at IS NOT NULL;

CREATE TRIGGER trg_recording_sessions_updated_at
  BEFORE UPDATE ON public.recording_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------

CREATE TABLE public.recording_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.recording_sessions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 60,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'video/webm',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  sha256 TEXT,
  app_name TEXT,
  window_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, sequence)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recording_chunks TO authenticated;
GRANT ALL ON public.recording_chunks TO service_role;
ALTER TABLE public.recording_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recording_chunks_select_company"
  ON public.recording_chunks FOR SELECT TO authenticated
  USING (company_id IS NULL OR public.user_in_company(auth.uid(), company_id));

CREATE POLICY "recording_chunks_admin_write"
  ON public.recording_chunks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_recording_chunks_session_seq
  ON public.recording_chunks (session_id, sequence);
CREATE INDEX idx_recording_chunks_started
  ON public.recording_chunks (started_at DESC);

-- ---------------------------------------------------------

CREATE TABLE public.data_retention_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('recordings','screenshots','keystrokes','activity_logs','violations','file_transfers')),
  retention_days INTEGER NOT NULL DEFAULT 30 CHECK (retention_days BETWEEN 1 AND 3650),
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, data_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_retention_policies TO authenticated;
GRANT ALL ON public.data_retention_policies TO service_role;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retention_select_company"
  ON public.data_retention_policies FOR SELECT TO authenticated
  USING (company_id IS NULL OR public.user_in_company(auth.uid(), company_id));

CREATE POLICY "retention_admin_write"
  ON public.data_retention_policies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_retention_company ON public.data_retention_policies (company_id);

CREATE TRIGGER trg_retention_updated_at
  BEFORE UPDATE ON public.data_retention_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
