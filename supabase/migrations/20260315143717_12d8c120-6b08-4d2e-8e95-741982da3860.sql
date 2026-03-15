
-- Add company-based RLS filtering to tables with company_id
-- Tables: employees, devices, teams, geofences, security_violations, violation_rules, work_schedules, agent_keys

-- EMPLOYEES: Add company-scoped SELECT policy
CREATE POLICY "Users can view own company employees"
  ON public.employees FOR SELECT TO authenticated
  USING (
    company_id IS NULL 
    OR company_id = public.get_user_company_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- DEVICES: Add company-scoped SELECT policy  
CREATE POLICY "Users can view own company devices"
  ON public.devices FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR company_id = public.get_user_company_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- TEAMS: Add company-scoped SELECT policy
CREATE POLICY "Users can view own company teams"
  ON public.teams FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR company_id = public.get_user_company_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- GEOFENCES: Add company-scoped SELECT policy
CREATE POLICY "Users can view own company geofences"
  ON public.geofences FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR company_id = public.get_user_company_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- SECURITY_VIOLATIONS: Add company-scoped SELECT policy
CREATE POLICY "Users can view own company violations"
  ON public.security_violations FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR company_id = public.get_user_company_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- VIOLATION_RULES: Add company-scoped SELECT policy
CREATE POLICY "Users can view own company violation rules"
  ON public.violation_rules FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR company_id = public.get_user_company_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- WORK_SCHEDULES: Add company-scoped SELECT policy
CREATE POLICY "Users can view own company schedules"
  ON public.work_schedules FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR company_id = public.get_user_company_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- AGENT_KEYS: Already has admin-only policies, add company scope
CREATE POLICY "Users can view own company agent keys"
  ON public.agent_keys FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR company_id = public.get_user_company_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
