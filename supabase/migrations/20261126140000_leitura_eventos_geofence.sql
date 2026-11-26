-- Leitura das tabelas de historico de geofence pelo gestor.
--
-- `geofence_events` e `geofence_states` foram criadas fora das migrations e a
-- migration 20261126120000 ligou RLS nas duas sem nenhuma policy ("Sem produtor
-- nem consumidor no repo ... Se algum dia tiver tela, a policy vem junto com a
-- tela"). A tela chegou: a edge check-geofence passou a gravar o estado de cada
-- funcionario em `geofence_states` e o historico de entrada/saida em
-- `geofence_events`, e a aba Historico da tela de geofence le os dois.
--
-- Escopo por empresa: as duas tabelas nao tem company_id, o dono vem da cerca
-- (`geofences.company_id`). Mesmo criterio das demais policies de escopo do
-- projeto (20261125193000): linha de cerca sem empresa segue visivel e admin
-- enxerga tudo.
--
-- Verginicao esperada:
--   select policyname, cmd, roles from pg_policies
--   where tablename in ('geofence_events','geofence_states');

GRANT SELECT ON public.geofence_events TO authenticated;
GRANT SELECT ON public.geofence_states TO authenticated;

DROP POLICY IF EXISTS "Escopo de empresa" ON public.geofence_events;
CREATE POLICY "Escopo de empresa" ON public.geofence_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.geofences g
      WHERE g.id = geofence_events.geofence_id
        AND (
          g.company_id IS NULL
          OR COALESCE(public.has_role(auth.uid(), 'admin'), false)
          OR COALESCE(public.user_in_company(auth.uid(), g.company_id), false)
        )
    )
  );

DROP POLICY IF EXISTS "Escopo de empresa" ON public.geofence_states;
CREATE POLICY "Escopo de empresa" ON public.geofence_states
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.geofences g
      WHERE g.id = geofence_states.geofence_id
        AND (
          g.company_id IS NULL
          OR COALESCE(public.has_role(auth.uid(), 'admin'), false)
          OR COALESCE(public.user_in_company(auth.uid(), g.company_id), false)
        )
    )
  );

-- Historico e consultado por data (lista) e por cerca (filtro da tela).
CREATE INDEX IF NOT EXISTS idx_geofence_events_occurred_at
  ON public.geofence_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_geofence_events_geofence_occurred
  ON public.geofence_events(geofence_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_geofence_states_geofence_id
  ON public.geofence_states(geofence_id);