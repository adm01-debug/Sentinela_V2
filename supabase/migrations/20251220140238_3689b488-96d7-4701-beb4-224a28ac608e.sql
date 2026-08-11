-- ============================================================
-- MULTI-TENANCY SUPPORT
-- ============================================================

-- 1. Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_employees INTEGER DEFAULT 100,
  plan TEXT DEFAULT 'free'
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 2. Create user_companies junction table
CREATE TABLE public.user_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- 3. Add company_id to main tables
ALTER TABLE public.employees ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.teams ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.security_violations ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.geofences ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.work_schedules ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.agent_keys ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.security_policies ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.violation_rules ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- 4. Create indexes for better performance
CREATE INDEX idx_employees_company_id ON public.employees(company_id);
CREATE INDEX idx_teams_company_id ON public.teams(company_id);
CREATE INDEX idx_security_violations_company_id ON public.security_violations(company_id);
CREATE INDEX idx_geofences_company_id ON public.geofences(company_id);
CREATE INDEX idx_work_schedules_company_id ON public.work_schedules(company_id);
CREATE INDEX idx_agent_keys_company_id ON public.agent_keys(company_id);
CREATE INDEX idx_user_companies_user_id ON public.user_companies(user_id);
CREATE INDEX idx_user_companies_company_id ON public.user_companies(company_id);

-- 5. Create helper function to get user's company
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.user_companies
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 6. Create function to check if user belongs to company
CREATE OR REPLACE FUNCTION public.user_in_company(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_companies
    WHERE user_id = _user_id
      AND company_id = _company_id
  )
$$;

-- 7. RLS Policies for companies
CREATE POLICY "Users can view their companies"
ON public.companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_companies
    WHERE user_companies.company_id = companies.id
    AND user_companies.user_id = auth.uid()
  )
);

CREATE POLICY "Company owners can update"
ON public.companies
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_companies
    WHERE user_companies.company_id = companies.id
    AND user_companies.user_id = auth.uid()
    AND user_companies.role = 'owner'
  )
);

-- 8. RLS Policies for user_companies
CREATE POLICY "Users can view their company memberships"
ON public.user_companies
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Company owners can manage memberships"
ON public.user_companies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_companies uc
    WHERE uc.company_id = user_companies.company_id
    AND uc.user_id = auth.uid()
    AND uc.role = 'owner'
  )
);

-- 9. Updated at trigger for companies
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();