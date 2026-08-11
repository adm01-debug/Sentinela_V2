
CREATE TABLE public.live_view_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agent_keys(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','ended','denied','error')),
  consent_required BOOLEAN NOT NULL DEFAULT true,
  consent_granted BOOLEAN,
  ip TEXT,
  user_agent TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  end_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lvs_agent ON public.live_view_sessions(agent_id, status);
CREATE INDEX idx_lvs_company ON public.live_view_sessions(company_id, created_at DESC);
CREATE INDEX idx_lvs_requester ON public.live_view_sessions(requested_by, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.live_view_sessions TO authenticated;
GRANT ALL ON public.live_view_sessions TO service_role;

ALTER TABLE public.live_view_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view sessions in their company"
  ON public.live_view_sessions FOR SELECT
  TO authenticated
  USING (
    public.user_in_company(auth.uid(), company_id)
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins create sessions in their company"
  ON public.live_view_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND public.user_in_company(auth.uid(), company_id)
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Requester or admin updates session"
  ON public.live_view_sessions FOR UPDATE
  TO authenticated
  USING (requested_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (requested_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_lvs_updated
  BEFORE UPDATE ON public.live_view_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_view_sessions;
ALTER TABLE public.live_view_sessions REPLICA IDENTITY FULL;

CREATE TABLE public.live_view_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_view_sessions(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lva_session ON public.live_view_audit(session_id, created_at);
CREATE INDEX idx_lva_company ON public.live_view_audit(company_id, created_at DESC);

GRANT SELECT, INSERT ON public.live_view_audit TO authenticated;
GRANT ALL ON public.live_view_audit TO service_role;

ALTER TABLE public.live_view_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit in their company"
  ON public.live_view_audit FOR SELECT
  TO authenticated
  USING (
    public.user_in_company(auth.uid(), company_id)
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated in company insert audit"
  ON public.live_view_audit FOR INSERT
  TO authenticated
  WITH CHECK (public.user_in_company(auth.uid(), company_id));
