
-- ============================================================
-- DLP CLASSIFIERS (catálogo compartilhado)
-- ============================================================
CREATE TABLE public.dlp_classifiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'pii',
  pattern TEXT NOT NULL,
  validator TEXT,
  default_severity TEXT NOT NULL DEFAULT 'medium' CHECK (default_severity IN ('low','medium','high','critical')),
  default_action TEXT NOT NULL DEFAULT 'alert' CHECK (default_action IN ('alert','redact','block')),
  is_builtin BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dlp_classifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view classifiers"
ON public.dlp_classifiers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage classifiers"
ON public.dlp_classifiers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_dlp_classifiers_updated
BEFORE UPDATE ON public.dlp_classifiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- DLP POLICIES (por empresa)
-- ============================================================
CREATE TABLE public.dlp_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  classifier_id UUID REFERENCES public.dlp_classifiers(id) ON DELETE SET NULL,
  custom_pattern TEXT,
  keywords TEXT[],
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  action TEXT NOT NULL DEFAULT 'alert' CHECK (action IN ('alert','redact','block')),
  scope TEXT[] NOT NULL DEFAULT ARRAY['clipboard','screenshot'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dlp_policies_company_active ON public.dlp_policies(company_id, is_active);

ALTER TABLE public.dlp_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view company policies"
ON public.dlp_policies FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND public.user_in_company(auth.uid(), company_id));

CREATE POLICY "Admins manage company policies"
ON public.dlp_policies FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND public.user_in_company(auth.uid(), company_id))
WITH CHECK (public.has_role(auth.uid(), 'admin') AND public.user_in_company(auth.uid(), company_id));

CREATE TRIGGER trg_dlp_policies_updated
BEFORE UPDATE ON public.dlp_policies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- DLP FINGERPRINTS (Exact Data Match)
-- ============================================================
CREATE TABLE public.dlp_fingerprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT,
  chunk_hash TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  total_chunks INTEGER NOT NULL DEFAULT 1,
  severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('low','medium','high','critical')),
  action TEXT NOT NULL DEFAULT 'block' CHECK (action IN ('alert','redact','block')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dlp_fingerprints_hash ON public.dlp_fingerprints(company_id, chunk_hash);

ALTER TABLE public.dlp_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view company fingerprints"
ON public.dlp_fingerprints FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND public.user_in_company(auth.uid(), company_id));

CREATE POLICY "Admins manage company fingerprints"
ON public.dlp_fingerprints FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND public.user_in_company(auth.uid(), company_id))
WITH CHECK (public.has_role(auth.uid(), 'admin') AND public.user_in_company(auth.uid(), company_id));

-- ============================================================
-- DLP INCIDENTS
-- ============================================================
CREATE TABLE public.dlp_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.dlp_policies(id) ON DELETE SET NULL,
  classifier_code TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('clipboard','screenshot','file','email','upload')),
  action_taken TEXT NOT NULL CHECK (action_taken IN ('alert','redact','block')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  employee_name TEXT,
  device_name TEXT,
  agent_key_id UUID REFERENCES public.agent_keys(id) ON DELETE SET NULL,
  app_name TEXT,
  window_title TEXT,
  match_count INTEGER NOT NULL DEFAULT 1,
  match_summary TEXT,
  evidence_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dlp_incidents_company_time ON public.dlp_incidents(company_id, detected_at DESC);
CREATE INDEX idx_dlp_incidents_severity ON public.dlp_incidents(company_id, severity, detected_at DESC);

ALTER TABLE public.dlp_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view company incidents"
ON public.dlp_incidents FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND public.user_in_company(auth.uid(), company_id));

CREATE POLICY "Admins update company incidents"
ON public.dlp_incidents FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND public.user_in_company(auth.uid(), company_id))
WITH CHECK (public.has_role(auth.uid(), 'admin') AND public.user_in_company(auth.uid(), company_id));

-- Inserts vêm de edge function (service role); sem policy de INSERT para clientes.

-- ============================================================
-- DLP REDACTION LOG (imutável / append-only)
-- ============================================================
CREATE TABLE public.dlp_redaction_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  incident_id UUID REFERENCES public.dlp_incidents(id) ON DELETE SET NULL,
  classifier_code TEXT NOT NULL,
  action TEXT NOT NULL,
  bbox_count INTEGER DEFAULT 0,
  evidence_hash TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dlp_redaction_company_time ON public.dlp_redaction_log(company_id, occurred_at DESC);

ALTER TABLE public.dlp_redaction_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view company redaction log"
ON public.dlp_redaction_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND public.user_in_company(auth.uid(), company_id));

-- Sem policies de INSERT/UPDATE/DELETE para clientes — append-only via service role.

-- ============================================================
-- SEED: Classifiers BR built-in
-- ============================================================
INSERT INTO public.dlp_classifiers (code, name, description, category, pattern, validator, default_severity, default_action) VALUES
('BR_CPF', 'CPF', 'Cadastro de Pessoa Física brasileiro', 'pii', '\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b', 'cpf', 'high', 'redact'),
('BR_CNPJ', 'CNPJ', 'Cadastro Nacional de Pessoa Jurídica', 'pii', '\b\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}\b', 'cnpj', 'medium', 'redact'),
('CREDIT_CARD', 'Cartão de Crédito', 'Visa, Master, Amex, Elo (com Luhn)', 'pci', '\b(?:\d[ -]*?){13,19}\b', 'luhn', 'critical', 'block'),
('EMAIL', 'E-mail', 'Endereço de e-mail', 'pii', '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', NULL, 'low', 'alert'),
('BR_PHONE', 'Telefone BR', 'Telefone brasileiro com DDD', 'pii', '(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}-?\d{4}', NULL, 'low', 'alert'),
('AWS_ACCESS_KEY', 'AWS Access Key', 'Chave de acesso AWS', 'secret', 'AKIA[0-9A-Z]{16}', NULL, 'critical', 'block'),
('GOOGLE_API_KEY', 'Google API Key', 'Chave de API Google', 'secret', 'AIza[0-9A-Za-z_-]{35}', NULL, 'critical', 'block'),
('GITHUB_PAT', 'GitHub PAT', 'Personal Access Token GitHub', 'secret', 'ghp_[A-Za-z0-9]{36}', NULL, 'critical', 'block'),
('SLACK_TOKEN', 'Slack Token', 'Token de bot/usuário Slack', 'secret', 'xox[baprs]-[0-9A-Za-z-]{10,48}', NULL, 'critical', 'block'),
('JWT_TOKEN', 'JWT Token', 'JSON Web Token', 'secret', 'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', NULL, 'high', 'redact'),
('PASSWORD_HEURISTIC', 'Senha em texto claro', 'Padrão senha=valor / password: valor', 'secret', '(?i)(senha|password|passwd|pwd)\s*[:=]\s*\S{4,}', NULL, 'high', 'block'),
('BR_PIX_RANDOM', 'Chave PIX aleatória', 'UUID usado como chave PIX', 'pii', '\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b', NULL, 'medium', 'alert');
