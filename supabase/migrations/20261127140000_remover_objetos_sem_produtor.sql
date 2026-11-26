-- Remocao de objetos de banco sem produtor e sem consumidor.
--
-- Medido contra a main cf5654370 (2026-11-26). Criterio de morte aplicado a
-- cada objeto abaixo: nenhum INSERT/UPSERT em src/ nem em supabase/functions/,
-- nenhuma leitura em src/ nem nas edges, e nenhum chamador de RPC.
--
-- Nenhum destes objetos e uma funcionalidade que sumiu: cada um foi superado
-- por um objeto mais novo, e a tela correspondente le o objeto novo.
--   productivity_metrics      -> productivity_logs (PR #372)
--   gamification_leaderboard  -> employee_points + points_history
--                                (edge award-gamification-points)
--   view latest_versions      -> entity_versions (src/hooks/useVersions.ts:62)
--   view recent_activities    -> activity_logs (src/hooks/useActivityHistory.ts:102)
--   record_violation_action   -> as duas chamadas diretas do painel

-- ---------------------------------------------------------------------------
-- Arquivo antes de remover.
--
-- `gamification_leaderboard` nasceu fora do versionamento, entao nao consta de
-- nenhuma migration e nao se conhece a forma das colunas do repo. O arquivo usa
-- CREATE TABLE AS SELECT * justamente para nao depender dessa forma.
--
-- A copia fica sem GRANT para anon/authenticated e com RLS ligada: e um cofre
-- para conferencia, nao uma tabela de aplicacao.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['gamification_leaderboard', 'productivity_metrics'] LOOP
        IF to_regclass('public.' || t) IS NOT NULL THEN
            EXECUTE format('DROP TABLE IF EXISTS public._arquivo_%s', t);
            EXECUTE format(
                'CREATE TABLE public._arquivo_%s AS SELECT * FROM public.%I',
                t, t
            );
            EXECUTE format(
                'ALTER TABLE public._arquivo_%s ENABLE ROW LEVEL SECURITY', t
            );
            EXECUTE format(
                'REVOKE ALL ON public._arquivo_%s FROM anon, authenticated', t
            );
        END IF;
    END LOOP;
END $$;

-- 1. productivity_metrics (criada em 20261121200000:16 para uma edge que nunca
--    a alimentou). O relatorio agendado de produtividade passou a ler
--    productivity_logs, a tabela que o agent-collector escreve
--    (supabase/functions/agent-collector/index.ts:231) - PR #372.
--    Estado: zero produtor, zero consumidor.
DROP TABLE IF EXISTS public.productivity_metrics;

-- 2. gamification_leaderboard. Era o ranking antigo; a tela de gamificacao foi
--    reescrita e le employee_points/points_history, alimentadas pela edge
--    award-gamification-points (index.ts:124,138) invocada por
--    src/hooks/useGamificationPage.ts:88. Estado: zero produtor, zero consumidor.
DROP TABLE IF EXISTS public.gamification_leaderboard;

-- 3. Views latest_versions e recent_activities: projecoes de conveniencia que
--    nenhuma tela nem edge consulta. As telas leem entity_versions e
--    activity_logs direto. View nao guarda dado, entao remover nao perde nada.
DROP VIEW IF EXISTS public.latest_versions;
DROP VIEW IF EXISTS public.recent_activities;

-- 4. record_violation_action (20251219220000:138): SECURITY DEFINER sem
--    chamador. O painel registra a acao e atualiza o status em duas chamadas
--    (src/hooks/useViolationActions.ts:114 +
--    src/hooks/useSecurityViolations.ts:293), entao a funcao nao cobre nada
--    que a aplicacao ja nao faca - so oferece execucao privilegiada de graca.
DROP FUNCTION IF EXISTS public.record_violation_action(uuid, text, text);

-- Verificacao: deve retornar 0 linhas depois dos DROP.
SELECT c.relname, c.relkind
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'productivity_metrics',
    'gamification_leaderboard',
    'latest_versions',
    'recent_activities'
  );