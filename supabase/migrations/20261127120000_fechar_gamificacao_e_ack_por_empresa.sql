-- Fecha a escrita aberta da gamificacao, escopa a leitura por empresa e devolve
-- a remocao de conquistas, que hoje falha em silencio.
--
-- Estado encontrado (replay de 129 migrations, 349 policies vivas):
--
-- 1. Escrita aberta a qualquer autenticado (fraude de pontos/badges).
--    `20251219210000_gamification.sql` criou:
--      * employee_points  "System can manage employee points"  FOR ALL    TO authenticated USING (true)
--      * points_history   "System can insert points history"   FOR INSERT TO authenticated WITH CHECK (true)
--      * employee_badges  "System can insert employee badges"  FOR INSERT TO authenticated WITH CHECK (true)
--    Qualquer funcionario logado concedia pontos e conquistas a qualquer
--    funcionario de qualquer empresa chamando o PostgREST direto.
--
-- 2. Leitura cross-tenant (sem isolamento de empresa).
--    `employee_points` e `points_history` nao tem `company_id` (so
--    `employee_id -> employees`) e tinham SELECT `USING (true)` para
--    authenticated. `employee_badges` ja foi escopado por empresa em
--    `20261122030000` (employee_badges_select_company); as outras duas ficaram
--    para tras.
--
-- 3. Escrita direta pelas RPCs SECURITY DEFINER sem REVOKE.
--    `add_employee_points` e `award_badge` sao SECURITY DEFINER e ficaram com o
--    EXECUTE padrao de PUBLIC, ou seja: rodam como owner e ignoram RLS. Dava
--    para conceder badge + pontos (`POST /rest/v1/rpc/award_badge`) sem passar
--    por nenhuma policy. Nenhum caminho do repo usa essas RPCs: a escrita viva
--    e a edge `award-gamification-points` (`award-gamification-points/index.ts:124,138`),
--    que roda com service_role, exige admin em `user_roles` e valida o vinculo
--    employee -> empresa do chamador.
--
-- 4. Remocao de conquista sem policy (funcionalidade pela metade).
--    `useEmployeeGamification.ts:133` faz `DELETE` em `employee_badges`, o painel
--    mostra o botao para admin, mas nao existia policy de DELETE: o PostgREST
--    apagava 0 linhas sem erro e a tela anunciava "Conquista removida".
--
-- Nada disso muda o que o front ja assume: `EmployeeGamificationPanel.tsx:30-31`
-- documenta "as tres tabelas tem escrita restrita a admin por RLS, por isso as
-- acoes so aparecem para user.isAdmin".

-- ---------------------------------------------------------------------------
-- 1. employee_points -- leitura por empresa, escrita so admin.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view employee points" ON public.employee_points;
DROP POLICY IF EXISTS "System can manage employee points" ON public.employee_points;
DROP POLICY IF EXISTS employee_points_select_company ON public.employee_points;
DROP POLICY IF EXISTS employee_points_write_admin ON public.employee_points;

CREATE POLICY employee_points_select_company ON public.employee_points
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR employee_id IN (
      SELECT e.id FROM public.employees e
      WHERE e.company_id = public.get_user_company_id(auth.uid())
    )
  );

CREATE POLICY employee_points_write_admin ON public.employee_points
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- 2. points_history -- leitura por empresa, escrita so admin.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view points history" ON public.points_history;
DROP POLICY IF EXISTS "System can insert points history" ON public.points_history;
DROP POLICY IF EXISTS points_history_select_company ON public.points_history;
DROP POLICY IF EXISTS points_history_write_admin ON public.points_history;

CREATE POLICY points_history_select_company ON public.points_history
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR employee_id IN (
      SELECT e.id FROM public.employees e
      WHERE e.company_id = public.get_user_company_id(auth.uid())
    )
  );

CREATE POLICY points_history_write_admin ON public.points_history
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- 3. employee_badges -- escrita so admin e DELETE, que faltava.
--    (o SELECT ja e `employee_badges_select_company` desde 20261122030000)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "System can insert employee badges" ON public.employee_badges;
DROP POLICY IF EXISTS employee_badges_write_admin ON public.employee_badges;

CREATE POLICY employee_badges_write_admin ON public.employee_badges
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- 4. RPCs SECURITY DEFINER de gamificacao -- sai do alcance de anon/authenticated.
--    A escrita continua possivel por service_role (edge) e por owner.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.add_employee_points(uuid, integer, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_badge(uuid, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_employee_points(uuid, integer, text, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.award_badge(uuid, text, jsonb) TO service_role;

-- ---------------------------------------------------------------------------
-- 5. policy_acknowledgments -- `USING (true)` criado por
--    20261126120000_habilitar_rls_policies_inertes.sql:41-44. A tabela guarda
--    device_name, ip_address, latitude/longitude, location_address, photo_url e
--    employee_name de cada aceite de politica (LGPD), e `/compliance`
--    (AppRoutes.tsx:260) nao tem guard: qualquer funcionario lia o registro
--    biométrico de todas as empresas. O consumo vivo e a contagem de adeso
--    (useCompliance.ts:26) e o INSERT do proprio aceite
--    (PolicyAcknowledgmentDialog.tsx:175), nenhum dos dois precisa da tabela
--    inteira.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS policy_acknowledgments_select_auth ON public.policy_acknowledgments;
DROP POLICY IF EXISTS policy_acknowledgments_select_escopo ON public.policy_acknowledgments;

CREATE POLICY policy_acknowledgments_select_escopo ON public.policy_acknowledgments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR user_id = auth.uid()
    OR user_id IN (
      SELECT uc.user_id FROM public.user_companies uc
      WHERE uc.company_id = public.get_user_company_id(auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Verificacao: nenhuma policy `USING (true)`/`WITH CHECK (true)` sobra nestas
-- tabelas (esperado: 0 linhas).
-- ---------------------------------------------------------------------------
SELECT c.relname AS tabela, p.polname AS policy
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('employee_points', 'points_history', 'employee_badges', 'policy_acknowledgments')
  AND (pg_get_expr(p.polqual, p.polrelid) = 'true' OR pg_get_expr(p.polwithcheck, p.polrelid) = 'true');
