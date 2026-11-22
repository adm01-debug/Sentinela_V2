-- ===================================================================
-- Policies publicas de INSERT vs policies de admin na mesma tabela
-- A tabela password_reset_requests tinha as policies "Admins can
-- delete/view/update" com roles {public} (default quando nao se declara
-- TO). policy_acknowledgments tinha "Admins can insert acknowledgments"
-- tambem em {public}.
-- Como policies PERMISSIVE sao agrupadas no mesmo WITH CHECK da operacao,
-- a policy de admin era avaliada no INSERT anonimo e referenciava
-- public.has_role(), que nao tem EXECUTE para anon.
-- Resultado medido em producao: POST /rest/v1/policy_acknowledgments e
-- POST /rest/v1/password_reset_requests retornavam
--   401 {"code":"42501","message":"permission denied for function has_role"}
-- ou "new row violates row-level security policy", mesmo com a policy
-- publica correta presente. O fluxo publico de solicitacao de reset e de
-- aceite de politica estava quebrado.
-- Correcao: restringir as policies de admin a authenticated. O caminho
-- publico passa a ser avaliado so contra a policy publica, sem has_role.
-- ===================================================================

ALTER POLICY "Admins can delete password reset requests"
  ON public.password_reset_requests TO authenticated;

ALTER POLICY "Admins can view password reset requests"
  ON public.password_reset_requests TO authenticated;

ALTER POLICY "Admins can update password reset requests"
  ON public.password_reset_requests TO authenticated;

ALTER POLICY "Admins can insert acknowledgments"
  ON public.policy_acknowledgments TO authenticated;

ALTER POLICY "Admins can view acknowledgments"
  ON public.policy_acknowledgments TO authenticated;