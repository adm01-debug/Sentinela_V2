-- ============================================================
-- GAP departamentos: tabela so permite SELECT
-- A unica policy de public.departments era departments_select_auth
-- (SELECT, qual=true). O front usa createDepartment,
-- updateDepartment e deleteDepartment (src/hooks/useDepartments.ts ->
-- DepartmentsPage/DepartmentDetailPage), entao criar/editar/excluir
-- falhava silenciosamente: a tela reportava sucesso sem gravar.
-- A tabela nao tem coluna de tenant (id, name, description,
-- manager_id, parent_id, created_at, updated_at), logo a policy e por
-- vinculo com a organizacao do usuario: qualquer usuario autenticado
-- com empresa ativa em user_companies (ou company_id no metadata).
-- ============================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "departments_insert_auth" ON public.departments;
CREATE POLICY "departments_insert_auth"
  ON public.departments FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_company_id(auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "departments_update_auth" ON public.departments;
CREATE POLICY "departments_update_auth"
  ON public.departments FOR UPDATE
  TO authenticated
  USING (public.get_user_company_id(auth.uid()) IS NOT NULL)
  WITH CHECK (public.get_user_company_id(auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "departments_delete_auth" ON public.departments;
CREATE POLICY "departments_delete_auth"
  ON public.departments FOR DELETE
  TO authenticated
  USING (public.get_user_company_id(auth.uid()) IS NOT NULL);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
REVOKE ALL ON public.departments FROM anon;
