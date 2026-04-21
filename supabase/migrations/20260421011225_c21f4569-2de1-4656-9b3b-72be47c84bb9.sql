
-- ============ behavioral_baselines ============
CREATE TABLE public.behavioral_baselines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  mean NUMERIC NOT NULL DEFAULT 0,
  std_dev NUMERIC NOT NULL DEFAULT 0,
  min_value NUMERIC NOT NULL DEFAULT 0,
  max_value NUMERIC NOT NULL DEFAULT 0,
  p25 NUMERIC,
  p50 NUMERIC,
  p75 NUMERIC,
  sample_size INTEGER NOT NULL DEFAULT 0,
  period_days INTEGER NOT NULL DEFAULT 30,
  insufficient_data BOOLEAN NOT NULL DEFAULT false,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, feature_name)
);

CREATE INDEX idx_behavioral_baselines_employee ON public.behavioral_baselines(employee_id, computed_at DESC);
CREATE INDEX idx_behavioral_baselines_company ON public.behavioral_baselines(company_id);

ALTER TABLE public.behavioral_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all baselines"
  ON public.behavioral_baselines FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view baselines in their company"
  ON public.behavioral_baselines FOR SELECT
  USING (company_id IS NULL OR user_in_company(auth.uid(), company_id));

CREATE TRIGGER trg_behavioral_baselines_updated
  BEFORE UPDATE ON public.behavioral_baselines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ user_risk_scores ============
CREATE TABLE public.user_risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'low',
  hst_score NUMERIC,
  z_score_max NUMERIC,
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  mitre_techniques TEXT[] DEFAULT ARRAY[]::TEXT[],
  period TEXT NOT NULL DEFAULT '24h',
  shadow_mode BOOLEAN NOT NULL DEFAULT false,
  alert_triggered BOOLEAN NOT NULL DEFAULT false,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_risk_scores_employee_calc ON public.user_risk_scores(employee_id, calculated_at DESC);
CREATE INDEX idx_user_risk_scores_company ON public.user_risk_scores(company_id);
CREATE INDEX idx_user_risk_scores_level ON public.user_risk_scores(level, calculated_at DESC);

ALTER TABLE public.user_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all risk scores"
  ON public.user_risk_scores FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view risk scores in their company"
  ON public.user_risk_scores FOR SELECT
  USING (company_id IS NULL OR user_in_company(auth.uid(), company_id));

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_risk_scores;

-- ============ risk_score_factors ============
CREATE TABLE public.risk_score_factors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  category TEXT NOT NULL DEFAULT 'behavior',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.risk_score_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view risk factors"
  ON public.risk_score_factors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage risk factors"
  ON public.risk_score_factors FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_risk_score_factors_updated
  BEFORE UPDATE ON public.risk_score_factors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ mitre_techniques ============
CREATE TABLE public.mitre_techniques (
  id TEXT NOT NULL PRIMARY KEY,
  tactic TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  severity_default TEXT NOT NULL DEFAULT 'medium',
  url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mitre_techniques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view MITRE techniques"
  ON public.mitre_techniques FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage MITRE techniques"
  ON public.mitre_techniques FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============ incident_mitre_mapping ============
CREATE TABLE public.incident_mitre_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL,
  incident_id UUID,
  technique_id TEXT NOT NULL REFERENCES public.mitre_techniques(id) ON DELETE CASCADE,
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incident_mitre_technique ON public.incident_mitre_mapping(technique_id);
CREATE INDEX idx_incident_mitre_incident ON public.incident_mitre_mapping(incident_id);

ALTER TABLE public.incident_mitre_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage incident MITRE mappings"
  ON public.incident_mitre_mapping FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view incident MITRE mappings in their company"
  ON public.incident_mitre_mapping FOR SELECT
  USING (company_id IS NULL OR user_in_company(auth.uid(), company_id));

-- ============ Seeds ============
INSERT INTO public.mitre_techniques (id, tactic, name, description, severity_default, url) VALUES
  ('T1078', 'Initial Access', 'Valid Accounts', 'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.', 'high', 'https://attack.mitre.org/techniques/T1078/'),
  ('T1530', 'Collection', 'Data from Cloud Storage', 'Adversaries may access data objects from improperly secured cloud storage.', 'high', 'https://attack.mitre.org/techniques/T1530/'),
  ('T1567', 'Exfiltration', 'Exfiltration Over Web Service', 'Adversaries may use an existing, legitimate external Web service to exfiltrate data.', 'critical', 'https://attack.mitre.org/techniques/T1567/'),
  ('T1071', 'Command and Control', 'Application Layer Protocol', 'Adversaries may communicate using OSI application layer protocols to avoid detection.', 'medium', 'https://attack.mitre.org/techniques/T1071/'),
  ('T1119', 'Collection', 'Automated Collection', 'Once established within a system, adversaries may use automated techniques for collecting internal data.', 'medium', 'https://attack.mitre.org/techniques/T1119/');

INSERT INTO public.risk_score_factors (name, display_name, description, weight, category) VALUES
  ('off_hours_activity', 'Off-Hours Activity', 'Activity detected outside normal working hours', 1.5, 'temporal'),
  ('weekend_activity', 'Weekend Activity', 'Unusual activity during weekends', 1.2, 'temporal'),
  ('volume_anomaly', 'Volume Anomaly', 'Significant deviation in keystroke or click volume', 1.0, 'behavior'),
  ('app_diversity', 'Application Diversity', 'Unusual variety of applications used', 0.8, 'behavior'),
  ('dlp_matches', 'DLP Matches', 'Sensitive data detected in clipboard or screen', 2.0, 'security'),
  ('screenshot_violations', 'Screenshot Violations', 'Policy violations detected in screenshots', 1.8, 'security'),
  ('productivity_drop', 'Productivity Drop', 'Significant productivity decrease', 0.7, 'behavior'),
  ('schedule_deviation', 'Schedule Deviation', 'Working hours outside assigned schedule', 1.0, 'temporal');
