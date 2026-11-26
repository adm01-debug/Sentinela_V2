-- Consolidacao de tabelas de configuracao duplicadas.
--
-- Medido contra a main 8613230d0 (2026-11-26):
--   * `whatsapp_settings` (20261122040000:75) duplica `whatsapp_config`
--     (20261121120000:36). As edges send-whatsapp e sync-whatsapp-templates
--     leem `whatsapp_config`, e a tela /integrations/whatsapp
--     (WhatsAppIntegrationPage -> useWhatsAppIntegrationPage) grava nela.
--     Nenhum arquivo de src/ ou supabase/functions/ referencia
--     `whatsapp_settings`; o unico resquicio era o hook orfao
--     src/hooks/useWhatsAppSettings.ts, removido neste mesmo commit.
--   * `scheduled_report_settings` (20251218164131) duplica `scheduled_reports`,
--     que e a tabela da edge send-scheduled-report e da tela
--     ScheduledReportsPage (/reports/scheduled, AppRoutes.tsx:196).
--     Nenhuma referencia no repo, nem no front nem nas edges.
--
-- As duas nasceram gravaveis apenas por admin (RLS), entao a aplicacao nunca
-- produziu linha nelas. Remover elimina schema sem dono funcional e tira do
-- drift guard duas tabelas que nenhuma tela consulta.

DROP TABLE IF EXISTS public.whatsapp_settings;
DROP TABLE IF EXISTS public.scheduled_report_settings;

-- Verificacao: deve retornar 0 linhas depois do DROP.
SELECT c.relname
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('whatsapp_settings', 'scheduled_report_settings');