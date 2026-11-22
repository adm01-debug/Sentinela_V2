-- Endurecimento de 9 policies SELECT com USING (true) e da view public.violations.
--
-- Achado por auditoria em producao (2026-11-22):
--   * `public.violations` e uma VIEW (`SELECT ... FROM security_violations`)
--     sem `security_invoker`, ou seja roda com os privilegios do owner: a RLS
--     de security_violations e ignorada e `GET /rest/v1/violations` devolvia
--     dados reais inclusive SEM TOKEN (anon). O front e as 20 edges ativas
--     usam `security_violations`; ninguem consulta a view.
--   * 9 policies de SELECT usavam USING (true), expondo dados de negocio de
--     todas as empresas a qualquer usuario autenticado.

-- ---------------------------------------------------------------------------
-- 1. View violations: passa a respeitar a RLS de quem consulta e perde o
--    acesso anonimo. Nenhum consumidor do repo sai prejudicado.
-- ---------------------------------------------------------------------------
ALTER VIEW public.violations SET (security_invoker = true);
REVOKE ALL ON public.violations FROM anon;

-- ---------------------------------------------------------------------------
-- 2. Dados de negocio por empresa.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS gamification_select_auth ON public.gamification_leaderboard;
CREATE POLICY gamification_select_company ON public.gamification_leaderboard
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR employee_id IN (
      SELECT e.id FROM public.employees e
      WHERE e.company_id = public.get_user_company_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS productivity_metrics_select_auth ON public.productivity_metrics;
CREATE POLICY productivity_metrics_select_company ON public.productivity_metrics
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR employee_id IN (
      SELECT e.id FROM public.employees e
      WHERE e.company_id = public.get_user_company_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Anyone can view employee badges" ON public.employee_badges;
CREATE POLICY employee_badges_select_company ON public.employee_badges
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR employee_id IN (
      SELECT e.id FROM public.employees e
      WHERE e.company_id = public.get_user_company_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS sync_logs_select_auth ON public.sync_logs;
CREATE POLICY sync_logs_select_company ON public.sync_logs
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR employee_id IN (
      SELECT e.id FROM public.employees e
      WHERE e.company_id = public.get_user_company_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS report_logs_select_auth ON public.report_logs;
CREATE POLICY report_logs_select_admin ON public.report_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users can view violation comments" ON public.violation_comments;
CREATE POLICY violation_comments_select_company ON public.violation_comments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR violation_id IN (
      SELECT v.id FROM public.security_violations v
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view violation actions" ON public.violation_actions;
CREATE POLICY violation_actions_select_company ON public.violation_actions
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR violation_id IN (
      SELECT v.id FROM public.security_violations v
      WHERE v.company_id = public.get_user_company_id(auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Configuracao sensivel - passa a exigir admin.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated can verify by report_id/signature" ON public.report_signatures;
CREATE POLICY report_signatures_select_company ON public.report_signatures
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR company_id = public.get_user_company_id(auth.uid())
  );

DROP POLICY IF EXISTS sensitive_keywords_select_auth ON public.sensitive_keywords;
CREATE POLICY sensitive_keywords_select_admin ON public.sensitive_keywords
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users can view whatsapp templates" ON public.whatsapp_templates;
CREATE POLICY whatsapp_templates_select_admin ON public.whatsapp_templates
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));