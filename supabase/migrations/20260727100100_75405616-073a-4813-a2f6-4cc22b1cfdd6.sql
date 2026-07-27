CREATE TABLE public.file_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,

  file_name TEXT NOT NULL,
  file_extension TEXT,
  file_size_bytes BIGINT NOT NULL DEFAULT 0 CHECK (file_size_bytes >= 0),
  file_hash TEXT,
  source_path TEXT,
  destination_path TEXT,

  channel TEXT NOT NULL CHECK (channel IN ('usb','browser_upload','browser_download','cloud_sync','email_attach','network_share','print')),
  direction TEXT NOT NULL DEFAULT 'out' CHECK (direction IN ('in','out')),
  application TEXT,
  process_name TEXT,
  destination_domain TEXT,
  removable_device_label TEXT,
  removable_device_serial TEXT,

  verdict TEXT NOT NULL DEFAULT 'allowed' CHECK (verdict IN ('allowed','blocked','flagged')),
  sensitivity TEXT NOT NULL DEFAULT 'unclassified' CHECK (sensitivity IN ('unclassified','public','internal','confidential','restricted')),
  dlp_policy_id UUID REFERENCES public.dlp_policies(id) ON DELETE SET NULL,
  dlp_incident_id UUID REFERENCES public.dlp_incidents(id) ON DELETE SET NULL,
  violation_id UUID REFERENCES public.security_violations(id) ON DELETE SET NULL,
  recording_session_id UUID REFERENCES public.recording_sessions(id) ON DELETE SET NULL,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.file_transfers TO authenticated;
GRANT ALL ON public.file_transfers TO service_role;

ALTER TABLE public.file_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view file transfers"
ON public.file_transfers FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR (company_id IS NOT NULL AND public.user_in_company(auth.uid(), company_id))
);

CREATE POLICY "Admins can update file transfers"
ON public.file_transfers FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete file transfers"
ON public.file_transfers FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_file_transfers_company_time ON public.file_transfers (company_id, occurred_at DESC);
CREATE INDEX idx_file_transfers_employee_time ON public.file_transfers (employee_id, occurred_at DESC);
CREATE INDEX idx_file_transfers_channel ON public.file_transfers (channel, occurred_at DESC);
CREATE INDEX idx_file_transfers_verdict ON public.file_transfers (verdict) WHERE verdict <> 'allowed';
CREATE INDEX idx_file_transfers_hash ON public.file_transfers (file_hash) WHERE file_hash IS NOT NULL;
CREATE UNIQUE INDEX idx_file_transfers_dedup
  ON public.file_transfers (employee_id, file_hash, channel, occurred_at)
  WHERE file_hash IS NOT NULL AND employee_id IS NOT NULL;

CREATE TRIGGER update_file_transfers_updated_at
BEFORE UPDATE ON public.file_transfers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();