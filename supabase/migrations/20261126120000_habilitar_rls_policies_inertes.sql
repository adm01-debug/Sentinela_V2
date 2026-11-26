-- Habilita RLS em tabelas que existem no banco fora das migrations e cujas
-- policies nunca tiveram efeito.
--
-- Causa (medida no repo):
--   * types.ts e gerado do banco: 9 tabelas vivas nao tem CREATE TABLE em nenhuma
--     migration (docs/agentes/banco.md:90-94). Sem migration, o RLS nunca foi
--     habilitado por aqui.
--   * `gamification_leaderboard` (3 policies), `policy_acknowledgments` (7),
--     `geofence_events` (3) e `geo_blocks` (2) tem policy criada em migration e
--     NENHUM `ENABLE ROW LEVEL SECURITY`. Policy em tabela com RLS desligado nao
--     tem efeito: a tabela segue legivel/gravavel por qualquer chave que tenha
--     GRANT -- inclusive anon. O endurecimento de 2026-11-22 acreditava ter
--     fechado isso (20261122030000:22-33).
--   * `docs/agentes/banco.md:106` registra `relrowsecurity = false` em
--     achievements, departments e gamification_leaderboard; departments ja foi
--     corrigido depois em 20261122021000:14.
--
-- Como este arquivo evita regressao:
--   * Leitura dos consumidores vivos continua igual. `useCompliance.ts:26,30`
--     (CompliancePage) le policy_acknowledgments e geo_blocking_settings;
--     `useGeoBlocking.ts:81,96,110,116,135,164,184` (GeoBlockingManager, dentro de
--     AdminSecurityPage sob AdminGuard -- AppRoutes.tsx:225-230) le e grava
--     geo_blocks e geo_blocking_settings. Por isso SELECT vai para `authenticated`
--     sem filtro (igual ao estado atual, que e RLS desligado) e escrita fica com
--     admin, que era a intencao declarada das policies existentes.
--   * Tabela sem nenhum consumidor no repo (0 chamadas em src/ e
--     supabase/functions/) nao recebe policy nova: fica fechada para anon e
--     authenticated e continua acessivel por service_role (edges/triggers).
--   * anon perde leitura em todas elas -- era o buraco real.
--
-- Idempotente: pode rodar de novo sem erro.

-- ---------------------------------------------------------------------------
-- 1. policy_acknowledgments -- 7 policies em migration, RLS desligada.
--    Mantem os INSERT existentes (20261122140000: "Allow employee confirmations
--    with own user_id", TO anon, authenticated) e ganha SELECT para o painel.
-- ---------------------------------------------------------------------------
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS policy_acknowledgments_select_auth ON public.policy_acknowledgments;
CREATE POLICY policy_acknowledgments_select_auth
  ON public.policy_acknowledgments FOR SELECT
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- 2. geo_blocks -- so tinha INSERT admin. Faltavam as outras operacoes que o
--    GeoBlockingManager usa hoje (select/update/delete).
-- ---------------------------------------------------------------------------
ALTER TABLE public.geo_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS geo_blocks_select_auth ON public.geo_blocks;
CREATE POLICY geo_blocks_select_auth
  ON public.geo_blocks FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS geo_blocks_update_admin ON public.geo_blocks;
CREATE POLICY geo_blocks_update_admin
  ON public.geo_blocks FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS geo_blocks_delete_admin ON public.geo_blocks;
CREATE POLICY geo_blocks_delete_admin
  ON public.geo_blocks FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- 3. geo_blocking_settings -- nenhuma policy em migration. Leitura e do
--    CompliancePage (todos os papeis) e escrita e do AdminSecurityPage.
-- ---------------------------------------------------------------------------
ALTER TABLE public.geo_blocking_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS geo_blocking_settings_select_auth ON public.geo_blocking_settings;
CREATE POLICY geo_blocking_settings_select_auth
  ON public.geo_blocking_settings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS geo_blocking_settings_insert_admin ON public.geo_blocking_settings;
CREATE POLICY geo_blocking_settings_insert_admin
  ON public.geo_blocking_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS geo_blocking_settings_update_admin ON public.geo_blocking_settings;
CREATE POLICY geo_blocking_settings_update_admin
  ON public.geo_blocking_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- 4. gamification_leaderboard -- RLS desligada fazia a policy
--    gamification_select_company (20261122030000:24) ser decorativa.
--    Nenhum consumidor no repo (0 chamadas), entao basta habilitar: a leitura
--    por empresa passa a valer de verdade.
-- ---------------------------------------------------------------------------
ALTER TABLE public.gamification_leaderboard ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 5. geofence_events -- tinha so INSERT para service_role, decorativo.
--    Sem consumidor no repo: habilita e mantem fechada a anon/authenticated.
-- ---------------------------------------------------------------------------
ALTER TABLE public.geofence_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 6. Sem produtor nem consumidor no repo e sem policy nenhuma: habilita o RLS e
--    deixa fechada para anon/authenticated (service_role continua passando).
--    Se algum dia tiver tela, a policy vem junto com a tela.
-- ---------------------------------------------------------------------------
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_locations ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Verificacao (rodar no banco e conferir que as 8 linhas tem relrowsecurity = t):
--
--   select c.relname, c.relrowsecurity, count(p.polname) as policies
--   from pg_class c
--   join pg_namespace n on n.oid = c.relnamespace
--   left join pg_policy p on p.polrelid = c.oid
--   where n.nspname = 'public'
--     and c.relname in ('achievements','policy_acknowledgments','geo_blocks',
--       'geo_blocking_settings','gamification_leaderboard','geofence_events',
--       'geofence_states','employee_locations')
--   group by 1, 2 order by 1;