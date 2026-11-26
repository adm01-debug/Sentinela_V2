-- Integridade da trilha de auditoria.
--
-- Dois buracos medidos no repo, ambos na mesma trilha que o painel exibe
-- (AuditLogPage aba "Alteracoes de cadastro" -> AuditTrailPanel -> audit_logs):
--
-- 1) public.create_audit_log(...) e SECURITY DEFINER e nasceu com o GRANT
--    EXECUTE default do Postgres (PUBLIC). Nenhum arquivo de src/ ou
--    supabase/functions/ chama essa RPC. A policy de INSERT de audit_logs foi
--    fechada em 20261122010000:58-63 (so service_role), mas a RPC SECURITY
--    DEFINER grava por cima disso: qualquer chave com EXECUTE podia inserir
--    linha de auditoria com user_id/user_email/action inventados. Trilha
--    forjavel = trilha sem valor probatorio.
--    Mesmo raciocinio para auto_log_activity()/log_activity() e para a tabela
--    activity_logs, que e uma segunda trilha criada em 20260102000000 e nunca
--    ligada: nenhum CREATE TRIGGER usa auto_log_activity e nenhum consumidor
--    vivo le activity_logs (useActivityHistory/useRealtimeActivity sao
--    orfaos). Ela seguia com SELECT para qualquer autenticado e INSERT com
--    user_id NULL, ou seja registro anonimo forjavel.
--
-- 2) public.audit_trigger_func() referencia NEW.name/OLD.name fixo. Em tabela
--    sem coluna name o plpgsql levanta "record NEW has no field name" e a DML
--    do usuario falha. Por isso user_roles (concessao/revogacao de papel, o
--    evento de maior valor da trilha) ficou fora da auditoria. Aqui a funcao
--    passa a ler to_jsonb(NEW/OLD) e ganha fallback de nome legivel, o que
--    mantem o comportamento atual nas 6 tabelas ja auditadas.
--
-- Como este arquivo evita regressao:
--   * As 6 triggers de 20251219190000 (employees, teams, violation_rules,
--     work_schedules, geofences, webhooks) sao o desenho original da trilha.
--     Elas nao existem no banco hoje (a migration que as cria nunca foi
--     concluida) e nao sao criadas aqui: a unica trigger nova e a de
--     user_roles.
--   * audit_trigger_func e SECURITY DEFINER e grava a linha em audit_logs
--     diretamente -- nao depende de public.create_audit_log, que nao existe em
--     producao (ESTADO_ATUAL.md:245-247).
--   * Nenhum codigo do front chama create_audit_log, log_activity nem
--     auto_log_activity (verificado por grep em src/ e supabase/functions/).
--   * audit_logs (a trilha oficial, com tela) nao perde nenhuma linha: so a
--     RPC de escrita direta deixa de ser chamavel por anon/authenticated.
--   * activity_logs nao e dropada: os dados existentes ficam preservados para
--     conferencia; so as policies abertas saem. A tabela fica exclusiva de
--     service_role.
--
-- Idempotente: REVOKE/GRANT/DROP POLICY IF EXISTS/CREATE OR REPLACE.

-- ---------------------------------------------------------------------------
-- 1. create_audit_log: escrita de auditoria passa a ser exclusiva de
--    service_role e das triggers (SECURITY DEFINER).
--
--    O REVOKE/GRANT fica no bloco 2b (varredura em pg_proc, depois dos CREATE
--    OR REPLACE). Motivo: a assinatura transcrita aqui derrubou o db push com
--    SQLSTATE 42883 (funcao ausente no banco) e qualquer diferenca entre a
--    assinatura escrita e a real produz o mesmo erro. A varredura revoga as
--    assinaturas que existirem e ignora as que nao existem.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 2. audit_trigger_func: nao depende mais da coluna name existir.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action TEXT;
  v_old_values JSONB;
  v_new_values JSONB;
  v_row JSONB;
  v_entity_name TEXT;
  v_user_id UUID;
  v_user_email TEXT;
  v_user_role TEXT;
  v_changes JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_new_values := to_jsonb(NEW);
    v_row := v_new_values;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
    v_row := v_new_values;
  ELSE
    v_action := 'delete';
    v_old_values := to_jsonb(OLD);
    v_row := v_old_values;
  END IF;

  -- Nome legivel sem assumir coluna "name": usa o primeiro campo
  -- identificavel disponivel na linha.
  v_entity_name := COALESCE(
    v_row->>'name',
    v_row->>'full_name',
    v_row->>'employee_name',
    v_row->>'title',
    v_row->>'email',
    v_row->>'role',
    v_row->>'id',
    ''
  );

  -- Escrita direta na trilha oficial (audit_logs). Nao usa
  -- public.create_audit_log: essa RPC esta na lista de "declaradas no repo,
  -- ausentes do banco" (ESTADO_ATUAL.md:245-247) e um PERFORM em funcao
  -- inexistente levanta erro em tempo de execucao, abortando a DML do usuario
  -- que dispara a trigger. A trigger e SECURITY DEFINER e grava ela mesma.
  v_user_id := auth.uid();

  SELECT u.email INTO v_user_email
  FROM auth.users u
  WHERE u.id = v_user_id;

  SELECT r.role::TEXT INTO v_user_role
  FROM public.user_roles r
  WHERE r.user_id = v_user_id
  LIMIT 1;

  IF v_old_values IS NOT NULL AND v_new_values IS NOT NULL THEN
    SELECT jsonb_object_agg(kv.key, kv.value) INTO v_changes
    FROM jsonb_each(v_new_values) AS kv
    WHERE v_old_values->kv.key IS DISTINCT FROM kv.value;
  END IF;

  INSERT INTO public.audit_logs (
    user_id, user_email, user_role,
    action, entity_type, entity_id, entity_name,
    old_values, new_values, changes,
    module, description, severity
  ) VALUES (
    v_user_id, v_user_email, v_user_role,
    v_action, TG_TABLE_NAME, v_row->>'id', v_entity_name,
    v_old_values, v_new_values, v_changes,
    TG_TABLE_SCHEMA, TG_OP || ' on ' || TG_TABLE_NAME, 'info'
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2b. EXECUTE das RPCs de escrita de auditoria: service_role e mais ninguem.
--     Feito por varredura em pg_proc (nome, sem transcrever assinatura):
--     revoga toda assinatura existente e ignora as ausentes, o que torna a
--     migration aplicavel em qualquer estado do banco (SQLSTATE 42883 era o
--     que travava o db push).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname AS sch,
           p.proname AS fname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('create_audit_log', 'log_activity',
                        'auto_log_activity', 'audit_trigger_func')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon, authenticated',
                   r.sch, r.fname, r.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO service_role',
                   r.sch, r.fname, r.args);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. user_roles entra na trilha: quem concedeu/revogou papel e quando.
--    Aparece sozinho no painel (useAuditTrail monta os tipos dinamicamente).
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- ---------------------------------------------------------------------------
-- 4. activity_logs: segunda trilha, nunca ligada, fica fechada e identificada.
--    A trilha oficial e audit_logs (triggers acima + AuditTrailPanel).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON public.activity_logs;

-- EXECUTE de log_activity() e auto_log_activity(): ja tratado no bloco 2b
-- (varredura em pg_proc, sem transcrever assinatura).

COMMENT ON TABLE public.activity_logs IS
  'OBSOLETA: segunda trilha de auditoria criada em 20260102000000, nunca ligada (nenhum CREATE TRIGGER usa auto_log_activity e nenhum consumidor vivo le). A trilha oficial e audit_logs, com triggers em employees/teams/violation_rules/work_schedules/geofences/webhooks/user_roles e tela em AuditLogPage. Mantida apenas com os dados historicos; escrita restrita a service_role.';

-- ---------------------------------------------------------------------------
-- Verificacao (rodar no banco):
--
--   -- 1. ninguem alem de service_role executa as RPCs de escrita de auditoria
--   select p.proname, r.rolname
--   from pg_proc p
--   join pg_namespace n on n.oid = p.pronamespace
--   join aclexplode(p.proacl) a on true
--   join pg_roles r on r.oid = a.grantee
--   where n.nspname = 'public'
--     and p.proname in ('create_audit_log','log_activity','auto_log_activity','audit_trigger_func')
--   order by 1, 2;
--   -- esperado: apenas service_role
--
--   -- 2. user_roles auditada
--   select tgname from pg_trigger where tgrelid = 'public.user_roles'::regclass and not tgisinternal;
--   -- esperado: audit_user_roles
--
--   -- 3. atividade administrativa recente na trilha oficial
--   select action, entity_type, entity_name, user_email, created_at
--   from public.audit_logs where entity_type = 'user_roles'
--   order by created_at desc limit 10;