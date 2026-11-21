-- ============================================================
-- HARDENING entity_versions: fecha INSERT anonimo
-- A migration 20261120133000 criou a policy de INSERT com
-- WITH CHECK (auth.uid() = changed_by OR changed_by IS NULL)
-- sem "TO authenticated". O escape "OR changed_by IS NULL"
-- permitia qualquer anon INSERIR linhas falsas no historico
-- (comprovado: anon INSERT -> HTTP 201).
-- Esta migration troca a policy por um check restrito a
-- authenticated: o changed_by precisa ser o proprio uid.
-- O front (useVersions.createVersion) sempre envia o uid do
-- usuario logado; o trigger create_entity_version escreve via
-- SECURITY DEFINER (nao passa por RLS). Nenhuma funcionalidade
-- e perdida.
-- ============================================================

DROP POLICY IF EXISTS "Users can create versions" ON public.entity_versions;
CREATE POLICY "Users can create versions"
  ON public.entity_versions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = changed_by);

-- garante grants minimos (nenhum grant a anon/anonymous)
REVOKE ALL ON public.entity_versions FROM anon, authenticated;
GRANT SELECT, INSERT ON public.entity_versions TO authenticated;
GRANT SELECT ON public.latest_versions TO authenticated;