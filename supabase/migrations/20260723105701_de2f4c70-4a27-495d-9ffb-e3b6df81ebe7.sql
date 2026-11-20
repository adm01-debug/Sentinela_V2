CREATE TABLE public.app_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  app_identifier TEXT NOT NULL,
  app_type TEXT NOT NULL DEFAULT 'application' CHECK (app_type IN ('application','website','domain')),
  category TEXT NOT NULL DEFAULT 'neutral' CHECK (category IN ('productive','neutral','unproductive')),
  display_name TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, app_identifier, app_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_categories TO authenticated;
GRANT ALL ON public.app_categories TO service_role;

ALTER TABLE public.app_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own company app_categories"
ON public.app_categories FOR SELECT TO authenticated
USING (public.user_in_company(auth.uid(), company_id));

CREATE POLICY "Users insert own company app_categories"
ON public.app_categories FOR INSERT TO authenticated
WITH CHECK (public.user_in_company(auth.uid(), company_id));

CREATE POLICY "Users update own company app_categories"
ON public.app_categories FOR UPDATE TO authenticated
USING (public.user_in_company(auth.uid(), company_id))
WITH CHECK (public.user_in_company(auth.uid(), company_id));

CREATE POLICY "Admins delete app_categories"
ON public.app_categories FOR DELETE TO authenticated
USING (public.user_in_company(auth.uid(), company_id) AND public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_app_categories_company ON public.app_categories(company_id);
CREATE INDEX idx_app_categories_lookup ON public.app_categories(company_id, app_identifier);

CREATE TRIGGER trg_app_categories_updated_at
BEFORE UPDATE ON public.app_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();