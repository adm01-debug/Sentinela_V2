-- Escopo de empresa em slack_integrations.
--
-- A policy "Admins manage slack integrations" (20260723155609) libera ALL para
-- qualquer admin sem olhar company_id. Como a linha guarda webhook_url (segredo
-- da integracao), um admin da empresa A le e edita a integracao da empresa B
-- chamando o PostgREST direto (grant SELECT/INSERT/UPDATE/DELETE TO authenticated
-- na linha 18 da mesma migracao). O tenant ja existe no dado desde
-- 20260723162702 (coluna company_id, gravada pelo card SlackIntegrationsCard),
-- falta a policy.
--
-- A policy e RESTRICTIVE: soma-se (AND) as politicas por papel que ja existem,
-- entao quem nao e admin continua sem acesso, e so o acesso cruzado entre
-- empresas sai.
--
-- Linha sem empresa (company_id IS NULL) segue visivel e gravavel: e o conceito
-- "Global (todas)" oferecido no formulario, nao sobra de migracao — user_in_company
-- e sempre false para NULL, por isso o OR explicito.
--
-- A edge slack-notify usa service_role (ignora RLS) e a view slack_webhook_mttr
-- tem security_invoker = true, entao ambas acompanham a policy nova sem mudanca.

DROP POLICY IF EXISTS "Escopo de empresa" ON public.slack_integrations;
CREATE POLICY "Escopo de empresa" ON public.slack_integrations
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (
    company_id IS NULL
    OR COALESCE(public.user_in_company(auth.uid(), company_id), false)
  )
  WITH CHECK (
    company_id IS NULL
    OR COALESCE(public.user_in_company(auth.uid(), company_id), false)
  );