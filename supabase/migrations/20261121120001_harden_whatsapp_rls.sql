-- ============================================================
-- HARDENING RLS: whatsapp_config e whatsapp_message_logs
-- Problema: a migration 20261121120000 da a QUALQUER authenticated
--   SELECT/USING true em whatsapp_config (expoe o access_token da Meta,
--   segredo do negocio) e INSERT/UPDATE para qualquer user.
--   whatsapp_message_logs ja foi endurecido antes, mas reforcamos.
-- Solucao: somente admin (has_role) le/grava config; SELECT de logs
--   segue autenticado (historico de alertas por operador), escrita
--   somente via service_role (edge function) ou admin.
-- Idempotente: DROP POLICY IF EXISTS + CREATE POLICY.
-- ============================================================

-- 1. whatsapp_config: leitura/escrita apenas por admins
DROP POLICY IF EXISTS "Users can view whatsapp config" ON public.whatsapp_config;
DROP POLICY IF EXISTS "Users can insert whatsapp config" ON public.whatsapp_config;
DROP POLICY IF EXISTS "Users can update whatsapp config" ON public.whatsapp_config;

CREATE POLICY "Admins can view whatsapp config"
  ON public.whatsapp_config FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert whatsapp config"
  ON public.whatsapp_config FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update whatsapp config"
  ON public.whatsapp_config FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. whatsapp_message_logs: SELECT segue para authenticated autenticado,
--    INSERT/UPDATE restrito a admin (a edge function usa service_role,
--    que ignora RLS e nao depende destas policies)
DROP POLICY IF EXISTS "Service can insert whatsapp logs" ON public.whatsapp_message_logs;
DROP POLICY IF EXISTS "Users can insert whatsapp logs" ON public.whatsapp_message_logs;

CREATE POLICY "Admins can insert whatsapp logs"
  ON public.whatsapp_message_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Nota: SELECT "Users can view whatsapp logs" (authenticated USING true)
-- permanece: operadores precisam ver o historico de envios. A escrita
-- em producao ocorre via service_role (borda send-whatsapp), imune a RLS.
