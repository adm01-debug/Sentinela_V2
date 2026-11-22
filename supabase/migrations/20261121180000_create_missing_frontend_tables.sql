-- Cria as 5 tabelas que o front consulta e que nunca foram criadas no banco.
-- Sintoma em producao: PGRST205 "Could not find the table ... in the schema cache"
-- em feature inteira (Internet Access regras, Push PWA, Reports, Scheduled
-- Reports e Session Manager). Os hooks ja existem e esperam exatamente estas
-- colunas; nenhum codigo de front foi alterado.

-- 1) internet_access_rules: regras allow/block por dominio/url/regex.
--    useInternetAccess.ts usa CRUD completo (SELECT/INSERT/UPDATE/DELETE).
CREATE TABLE IF NOT EXISTS public.internet_access_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('allow', 'block')),
  pattern text NOT NULL,
  pattern_type text NOT NULL DEFAULT 'domain' CHECK (pattern_type IN ('domain', 'url', 'regex')),
  applies_to text NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'teams', 'employees')),
  target_ids uuid[] DEFAULT '{}'::uuid[],
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) push_subscriptions: subscriptions Web Push da PWA.
--    usePWAPushNotifications.ts faz upsert por endpoint e delete por endpoint.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  subscription jsonb NOT NULL,
  user_agent text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) reports: historico de relatorios gerados pela edge generate-report.
--    useReportsPage.ts insere status 'pending' e a edge atualiza para
--    'generating'/'completed'/'failed' + file_url.
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('productivity', 'violations', 'attendance', 'summary')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  file_url text,
  error_message text,
  requested_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) scheduled_reports: agendamentos de relatorio (cron + destinatarios).
--    useScheduledReports.ts usa CRUD completo.
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  report_type text NOT NULL,
  schedule text NOT NULL,
  recipients text[] NOT NULL DEFAULT '{}'::text[],
  filters jsonb,
  format text NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'xlsx')),
  is_active boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5) user_sessions: sessoes por dispositivo do proprio usuario.
--    useSessionManager.ts filtra por user_id = auth.uid() e revoga por id.
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  device text,
  browser text,
  ip_address text,
  location text,
  last_activity timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internet_access_rules_active
  ON public.internet_access_rules (is_active, rule_type);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON public.push_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created
  ON public.reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_requested_by
  ON public.reports (requested_by);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active
  ON public.scheduled_reports (is_active, next_run_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user
  ON public.user_sessions (user_id, last_activity DESC);

ALTER TABLE public.internet_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- internet_access_rules: admin gerencia (padrao de internet_access_settings).
DROP POLICY IF EXISTS "Admins can view internet access rules" ON public.internet_access_rules;
CREATE POLICY "Admins can view internet access rules"
  ON public.internet_access_rules FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can manage internet access rules" ON public.internet_access_rules;
CREATE POLICY "Admins can manage internet access rules"
  ON public.internet_access_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- push_subscriptions: cada usuario so ve/gerencia a propria subscription.
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- reports: admin ve todos; o solicitante ve os proprios.
DROP POLICY IF EXISTS "Admins can manage reports" ON public.reports;
CREATE POLICY "Admins can manage reports"
  ON public.reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT TO authenticated
  USING (requested_by = auth.uid());

-- scheduled_reports: admin gerencia (agendamento afeta a organizacao).
DROP POLICY IF EXISTS "Admins can manage scheduled reports" ON public.scheduled_reports;
CREATE POLICY "Admins can manage scheduled reports"
  ON public.scheduled_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_sessions: cada usuario gerencia apenas as proprias sessoes.
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.user_sessions;
CREATE POLICY "Users can insert own sessions"
  ON public.user_sessions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;
CREATE POLICY "Users can update own sessions"
  ON public.user_sessions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.user_sessions;
CREATE POLICY "Users can delete own sessions"
  ON public.user_sessions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- anon nao tem acesso a nenhuma delas
REVOKE ALL ON public.internet_access_rules FROM anon;
REVOKE ALL ON public.push_subscriptions FROM anon;
REVOKE ALL ON public.reports FROM anon;
REVOKE ALL ON public.scheduled_reports FROM anon;
REVOKE ALL ON public.user_sessions FROM anon;