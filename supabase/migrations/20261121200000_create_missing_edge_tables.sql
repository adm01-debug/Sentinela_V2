-- Tabelas usadas por edge functions ativas que nunca existiram no banco.
-- Evidência: probe REST com service key retornava 404 (PGRST205) em
-- sensitive_keywords, productivity_metrics, report_logs, rate_limit_alerts, sync_logs.
-- Uso: ocr-screenshot (keywords), send-scheduled-report (dados + log),
-- send-rate-limit-alert (alerta/auto-block de IP), sync-employee (log de sync).

CREATE TABLE IF NOT EXISTS public.sensitive_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS sensitive_keywords_keyword_key ON public.sensitive_keywords (lower(keyword));

CREATE TABLE IF NOT EXISTS public.productivity_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  active_minutes integer NOT NULL DEFAULT 0,
  idle_minutes integer NOT NULL DEFAULT 0,
  total_minutes integer NOT NULL DEFAULT 0,
  productivity_score numeric(5,2),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS productivity_metrics_date_idx ON public.productivity_metrics (date DESC);
CREATE INDEX IF NOT EXISTS productivity_metrics_employee_idx ON public.productivity_metrics (employee_id);

CREATE TABLE IF NOT EXISTS public.report_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.scheduled_reports(id) ON DELETE CASCADE,
  executed_at timestamptz NOT NULL DEFAULT now(),
  manual boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'success',
  records_count integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS report_logs_report_idx ON public.report_logs (report_id, executed_at DESC);

CREATE TABLE IF NOT EXISTS public.rate_limit_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  endpoint text,
  request_count integer NOT NULL DEFAULT 0,
  threshold integer NOT NULL DEFAULT 0,
  window_seconds integer NOT NULL DEFAULT 60,
  alerted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rate_limit_alerts_ip_idx ON public.rate_limit_alerts (ip, alerted_at DESC);

CREATE TABLE IF NOT EXISTS public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  source text,
  synced_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'success',
  data jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sync_logs_employee_idx ON public.sync_logs (employee_id, synced_at DESC);

ALTER TABLE public.sensitive_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Leitura para usuários autenticados; escrita apenas via service_role (edges/crons).
DROP POLICY IF EXISTS "sensitive_keywords_select_auth" ON public.sensitive_keywords;
CREATE POLICY "sensitive_keywords_select_auth" ON public.sensitive_keywords
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sensitive_keywords_admin_write" ON public.sensitive_keywords;
CREATE POLICY "sensitive_keywords_admin_write" ON public.sensitive_keywords
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','Admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','Admin')));

DROP POLICY IF EXISTS "productivity_metrics_select_auth" ON public.productivity_metrics;
CREATE POLICY "productivity_metrics_select_auth" ON public.productivity_metrics
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "report_logs_select_auth" ON public.report_logs;
CREATE POLICY "report_logs_select_auth" ON public.report_logs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "rate_limit_alerts_admin_read" ON public.rate_limit_alerts;
CREATE POLICY "rate_limit_alerts_admin_read" ON public.rate_limit_alerts
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','Admin')));

DROP POLICY IF EXISTS "sync_logs_select_auth" ON public.sync_logs;
CREATE POLICY "sync_logs_select_auth" ON public.sync_logs
  FOR SELECT TO authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sensitive_keywords TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.productivity_metrics TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_logs TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limit_alerts TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_logs TO authenticated, service_role;
REVOKE ALL ON public.sensitive_keywords FROM anon;
REVOKE ALL ON public.productivity_metrics FROM anon;
REVOKE ALL ON public.report_logs FROM anon;
REVOKE ALL ON public.rate_limit_alerts FROM anon;
REVOKE ALL ON public.sync_logs FROM anon;

CREATE OR REPLACE FUNCTION public.set_sensitive_keywords_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS sensitive_keywords_updated_at ON public.sensitive_keywords;
CREATE TRIGGER sensitive_keywords_updated_at
  BEFORE UPDATE ON public.sensitive_keywords
  FOR EACH ROW EXECUTE FUNCTION public.set_sensitive_keywords_updated_at();