-- ============================================================================
-- Liga as triggers de auditoria das tabelas de cadastro.
--
-- Antes desta migration a trilha oficial (audit_logs) so recebia escrita
-- administrativa de user_roles (trigger audit_user_roles). A tela de auditoria
-- rotula justamente employees, teams, violation_rules, work_schedules,
-- employee_schedules, geofences, webhooks, profiles e departments
-- (src/hooks/useAuditTrail.ts:48-59) e nenhuma delas
-- tinha trigger: a tela ficava praticamente vazia e o gestor nao conseguia
-- responder "quem mudou esta escala".
--
-- As triggers foram desenhadas em 20251219190000_complete_audit_system.sql
-- (:173-201) e nunca criadas, porque naquele momento audit_trigger_func chamava
-- public.create_audit_log, RPC que nunca existiu no banco. plpgsql resolve
-- chamada de funcao em tempo de execucao: o CREATE TRIGGER passaria e a
-- primeira escrita em employees abortaria com "function does not exist".
-- A funcao foi reescrita em 20261127090000:60-143 para gravar direto em
-- audit_logs (SECURITY DEFINER), sem RPC. Com isso a trigger pode ser ligada.
--
-- Idempotente: DROP TRIGGER IF EXISTS antes de cada CREATE e checagem em
-- to_regclass, para o db push nao abortar se alguma tabela nao existir.
-- ============================================================================

DO $$
DECLARE
  v_spec RECORD;
BEGIN
  FOR v_spec IN
    SELECT *
    FROM (VALUES
      ('employees',       'audit_employees',       'INSERT OR UPDATE OR DELETE', NULL),
      ('teams',           'audit_teams',           'INSERT OR UPDATE OR DELETE', NULL),
      ('violation_rules', 'audit_violation_rules', 'INSERT OR UPDATE OR DELETE', NULL),
      ('work_schedules',  'audit_work_schedules',  'INSERT OR UPDATE OR DELETE', NULL),
      -- Atribuicao escala<->funcionario: e o que responde "quem mudou esta
      -- escala" de fato; sem ela a trilha so cobria o modelo da escala.
      ('employee_schedules', 'audit_employee_schedules', 'INSERT OR UPDATE OR DELETE', NULL),
      ('geofences',       'audit_geofences',       'INSERT OR UPDATE OR DELETE', NULL),
      -- Usuario e departamento tambem sao cadastro: sem eles o gestor nao
      -- descobre quem mudou o nome/e-mail de um usuario nem quem apagou um
      -- departamento (os dois sao escritos pelas telas de Usuarios/Departamentos).
      ('profiles',        'audit_profiles',        'INSERT OR UPDATE OR DELETE', NULL),
      ('departments',     'audit_departments',     'INSERT OR UPDATE OR DELETE', NULL),
      -- send-webhook reescreve last_status/last_response_code/last_triggered_at
      -- a cada disparo (supabase/functions/send-webhook/index.ts:173-177). Sem
      -- o filtro, cada envio viraria uma linha "update" e enterraria as
      -- alteracoes de cadastro (a tela mostra as 200 ultimas). O WHEN tem de
      -- ficar num gatilho so de UPDATE: um gatilho com DELETE nao aceita WHEN
      -- que cite NEW ("DELETE trigger's WHEN condition cannot reference NEW").
      ('webhooks',        'audit_webhooks',        'INSERT OR DELETE',           NULL),
      ('webhooks',        'audit_webhooks_update', 'UPDATE',
       '((to_jsonb(NEW) - ''last_status'' - ''last_response_code'' - ''last_triggered_at'') IS DISTINCT FROM (to_jsonb(OLD) - ''last_status'' - ''last_response_code'' - ''last_triggered_at''))')
    ) AS t(table_name, trigger_name, events, when_expr)
  LOOP
    IF to_regclass('public.' || v_spec.table_name) IS NULL THEN
      RAISE NOTICE 'public.% nao existe: trigger % ignorada.',
        v_spec.table_name, v_spec.trigger_name;
      CONTINUE;
    END IF;

    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I',
      v_spec.trigger_name, v_spec.table_name);
    EXECUTE format(
      'CREATE TRIGGER %I AFTER %s ON public.%I FOR EACH ROW%s '
      'EXECUTE FUNCTION public.audit_trigger_func()',
      v_spec.trigger_name, v_spec.events, v_spec.table_name,
      COALESCE(' WHEN ' || v_spec.when_expr, '')
    );
    RAISE NOTICE 'trigger % criada em public.%',
      v_spec.trigger_name, v_spec.table_name;
  END LOOP;
END $$;

-- Verificacao (rodar no banco apos o push):
--   select c.relname as tabela, t.tgname
--   from pg_trigger t join pg_class c on c.oid = t.tgrelid
--   where not t.tgisinternal and t.tgname like 'audit_%' order by 1, 2;
--   -- esperado: 11 linhas (10 acima + audit_user_roles)
--
--   select entity_type, action, count(*), max(created_at)
--   from public.audit_logs group by 1, 2 order by 4 desc;
--   -- esperado: linhas novas de employees/teams/... a partir do push