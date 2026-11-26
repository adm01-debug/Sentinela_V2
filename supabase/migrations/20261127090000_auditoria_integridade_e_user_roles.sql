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
--   * As 6 triggers existentes (employees, teams, violation_rules,
--     work_schedules, geofences, webhooks) chamam audit_trigger_func, que e
--     SECURITY DEFINER: ela executa create_audit_log como dono, entao revogar
--     EXECUTE de authenticated nao interrompe as triggers.
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
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.create_audit_log(text, text, text, text, jsonb, jsonb, text, text, text)
  FROM anon, authenticated, PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_audit_log(text, text, text, text, jsonb, jsonb, text, text, text)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.audit_trigger_func() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.audit_trigger_func() TO service_role;

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

  PERFORM public.create_audit_log(
    v_action,
    TG_TABLE_NAME,
    v_row->>'id',
    v_entity_name,
    v_old_values,
    v_new_values,
    TG_TABLE_SCHEMA,
    TG_OP || ' on ' || TG_TABLE_NAME,
    'info'
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

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

REVOKE EXECUTE ON FUNCTION public.log_activity(text, uuid, text, text, jsonb, jsonb)
  FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_activity(text, uuid, text, text, jsonb, jsonb)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.auto_log_activity() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_log_activity() TO service_role;

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