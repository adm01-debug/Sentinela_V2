-- ============================================================
-- Telas de gestao liam 0 linhas com RLS ligada.
--
-- 1) public.departments (RLS ligada em 20261122021000)
--    A tabela tem policies de INSERT/UPDATE/DELETE e NENHUMA de SELECT.
--    Sem policy de SELECT a tabela inteira fica invisivel para
--    `authenticated`, entao DepartmentsPage, DepartmentDetailPage e o
--    organograma (src/hooks/useDepartments.ts:33,45,61,78,106 e
--    OrganizationChartPage) listam vazio.
--    A tabela nao tem coluna de tenant (id, name, description,
--    manager_id, parent_id, created_at, updated_at - conferido em
--    src/integrations/supabase/types.ts), entao a unica ligacao possivel
--    com a organizacao e o vinculo do proprio usuario. A policy repete o
--    criterio que as policies de escrita da mesma tabela ja usam:
--    usuario autenticado com empresa ativa.
--
-- 2) public.profiles (RLS ligada em 20251217201405:23)
--    Com apenas "Users can view own profile" (auth.uid() = id), a tela
--    /users lista somente o proprio usuario (src/hooks/useUsers.ts:38).
--    A policy abaixo libera o admin da empresa a ver os usuarios dela,
--    julgando a empresa do ALVO pela mesma funcao SECURITY DEFINER usada
--    no resto do schema.
--
--    O teste de admin usa `role::text`, e nao `has_role(...,'admin')`:
--    producao guarda mais valores que a migration original (o tipo gerado
--    em src/integrations/supabase/types.ts lista admin, user, Admin,
--    Analyst, Manager, User) e o AdminGuard aceita 'admin' e 'Admin'.
--    Comparar como texto vale para enum e para text, sem depender do tipo
--    efetivo da coluna (a migration 20251219180000:50 a converteu para
--    TEXT e producao diverge das migrations).
--
--    Nao ha policy de DELETE de proposito: apagar a linha de `profiles`
--    nao revoga o login (o app autentica por auth.users + user_roles e
--    useAuth nao le profiles), entao a remocao passou a ser feita pela
--    edge `admin-remove-user` (auth.admin.deleteUser + cascade de
--    profiles.id / user_roles.user_id).
-- ============================================================

-- 1) departments: restaura a leitura para usuario com empresa ativa
ALTER TABLE IF EXISTS public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "departments_select_auth" ON public.departments;
CREATE POLICY "departments_select_auth"
  ON public.departments FOR SELECT
  TO authenticated
  USING (public.get_user_company_id(auth.uid()) IS NOT NULL);

GRANT SELECT ON public.departments TO authenticated;
REVOKE ALL ON public.departments FROM anon;

-- 2) profiles: o proprio usuario ou um admin da mesma empresa
DROP POLICY IF EXISTS "profiles_select_escopo" ON public.profiles;
CREATE POLICY "profiles_select_escopo"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR (
      EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role::text IN ('admin', 'Admin')
      )
      AND public.get_user_company_id(id) IS NOT NULL
      AND public.get_user_company_id(id) = public.get_user_company_id(auth.uid())
    )
  );

-- Verificacao: as duas policies devem aparecer com qual nao-trivial.
SELECT c.relname AS tabela,
       p.polname AS policy,
       p.polcmd AS comando,
       pg_get_expr(p.polqual, p.polrelid) AS usando
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('departments', 'profiles')
ORDER BY c.relname, p.polname;
