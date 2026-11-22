-- Cria as 5 tabelas de configuracao que hooks do front consultam e que nunca
-- existiram no banco. Sintoma: PGRST205 em useAppConfig, useFeatureFlags,
-- useRateLimitSettings, useSubscription e useWhatsAppSettings.

-- 1) app_config: configuracao global da aplicacao (uma linha por tenant).
CREATE TABLE IF NOT EXISTS public.app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message text,
  allowed_ips text[] DEFAULT '{}'::text[],
  max_upload_size integer NOT NULL DEFAULT 10485760,
  session_timeout integer NOT NULL DEFAULT 3600,
  mfa_required boolean NOT NULL DEFAULT false,
  default_language text NOT NULL DEFAULT 'pt-BR',
  supported_languages text[] NOT NULL DEFAULT '{pt-BR,en,es}'::text[],
  theme jsonb NOT NULL DEFAULT '{"primaryColor":"#1890ff","secondaryColor":"#52c41a"}'::jsonb,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS app_config_company_uniq
  ON public.app_config (company_id);

-- 2) feature_flags: flags por tenant.
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  conditions jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS feature_flags_company_name_uniq
  ON public.feature_flags (company_id, name);

-- 3) rate_limit_settings: limite por endpoint (companhia nula = global).
CREATE TABLE IF NOT EXISTS public.rate_limit_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  max_requests integer NOT NULL DEFAULT 60,
  window_seconds integer NOT NULL DEFAULT 60,
  block_duration_seconds integer NOT NULL DEFAULT 300,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS rate_limit_settings_company_endpoint_uniq
  ON public.rate_limit_settings (company_id, endpoint);

-- 4) subscriptions: plano do usuario.
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT now() + interval '30 days',
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  features text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_uniq
  ON public.subscriptions (user_id);

-- 5) whatsapp_settings: configuracao Meta por tenant (distinta de whatsapp_config).
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  phone_number_id text,
  access_token text,
  business_account_id text,
  webhook_verify_token text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_settings_company_uniq
  ON public.whatsapp_settings (company_id);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view app config" ON public.app_config;
CREATE POLICY "Admins can view app config"
  ON public.app_config FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin')
         OR company_id IS NOT DISTINCT FROM public.get_user_company_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage app config" ON public.app_config;
CREATE POLICY "Admins can manage app config"
  ON public.app_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated can view feature flags" ON public.feature_flags;
CREATE POLICY "Authenticated can view feature flags"
  ON public.feature_flags FOR SELECT TO authenticated
  USING (company_id IS NULL
         OR company_id IS NOT DISTINCT FROM public.get_user_company_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature flags"
  ON public.feature_flags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view rate limit settings" ON public.rate_limit_settings;
CREATE POLICY "Admins can view rate limit settings"
  ON public.rate_limit_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin')
         OR company_id IS NOT DISTINCT FROM public.get_user_company_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage rate limit settings" ON public.rate_limit_settings;
CREATE POLICY "Admins can manage rate limit settings"
  ON public.rate_limit_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view whatsapp settings" ON public.whatsapp_settings;
CREATE POLICY "Admins can view whatsapp settings"
  ON public.whatsapp_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin')
         OR company_id IS NOT DISTINCT FROM public.get_user_company_id(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage whatsapp settings" ON public.whatsapp_settings;
CREATE POLICY "Admins can manage whatsapp settings"
  ON public.whatsapp_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.app_config FROM anon;
REVOKE ALL ON public.feature_flags FROM anon;
REVOKE ALL ON public.rate_limit_settings FROM anon;
REVOKE ALL ON public.subscriptions FROM anon;
REVOKE ALL ON public.whatsapp_settings FROM anon;