-- ============================================================
-- HARDENING: policies de escrita abertas para qualquer authenticated
-- Achado da varredura de pg_policies (qual/with_check = true):
--
--   whatsapp_templates "System can upsert"  ALL  authenticated USING true
--     -> qualquer usuario autenticado podia INSERT/UPDATE/DELETE templates
--        de qualquer empresa. A edge sync-whatsapp-templates usa
--        service_role (imune a RLS) e continua funcionando. Existe
--        UNIQUE(template_id); trocar template_id quebra o sync da Meta.
--
--   file_transfers "Edge functions can insert"  INSERT  authenticated true
--   geofence_events "Edge functions insert"     INSERT  authenticated true
--     -> qualquer usuario autenticado podia injetar transferencia de
--        arquivo (com veredito dlp) ou evento de geofence falso; os 4
--        escritores reais (ingest-file-transfer, check-geofence,
--        expire-recordings, admin UI Delete/Update) ja usam service_role
--        ou policies proprias.
--
--   audit_logs "System can insert audit logs"  INSERT  authenticated true
--     -> qualquer usuario podia forjar trilha de auditoria. A coluna
--        user_id tem FK para profiles, mas o conteudo (entity/action) era
--        livre. Nenhum codigo do front escreve em audit_logs.
--
-- Solucao: escrita de template passa a exigir admin (front so faz SELECT);
--   escritas de ingest passam a ser exclusivas de service_role (edge
--   functions), mantendo as policies de SELECT/UPDATE/DELETE intactas.
-- Idempotente: DROP POLICY IF EXISTS + CREATE POLICY.
-- ============================================================

-- 1. whatsapp_templates: escrita apenas por admin
DROP POLICY IF EXISTS "System can upsert whatsapp templates" ON public.whatsapp_templates;

CREATE POLICY "Admins can manage whatsapp templates"
  ON public.whatsapp_templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. file_transfers: INSERT somente via service_role (edge function)
DROP POLICY IF EXISTS "Edge functions can insert file_transfers" ON public.file_transfers;

CREATE POLICY "Service role inserts file_transfers"
  ON public.file_transfers FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 3. geofence_events: INSERT somente via service_role (edge function)
DROP POLICY IF EXISTS "Edge functions insert geofence_events" ON public.geofence_events;

CREATE POLICY "Service role inserts geofence_events"
  ON public.geofence_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 4. audit_logs: INSERT somente via service_role (edge functions/triggers)
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "Service role inserts audit logs"
  ON public.audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);