-- =============================================
-- SISTEMA DE AUDITORIA COMPLETO
-- =============================================

-- Tabela de auditoria genérica para todas as operações
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Quem fez a ação
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    user_role TEXT,
    
    -- O que foi feito
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', 'export', 'login', 'logout'
    entity_type TEXT NOT NULL, -- 'employee', 'team', 'violation', 'settings', etc.
    entity_id TEXT, -- ID do registro afetado
    entity_name TEXT, -- Nome legível do registro
    
    -- Detalhes da mudança
    old_values JSONB, -- Valores anteriores (para update/delete)
    new_values JSONB, -- Novos valores (para create/update)
    changes JSONB, -- Apenas os campos que mudaram
    
    -- Contexto
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    
    -- Metadados
    module TEXT, -- Módulo do sistema onde ocorreu
    description TEXT, -- Descrição legível da ação
    severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity) WHERE severity != 'info';

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver logs de auditoria
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- Todos podem inserir (o sistema insere via service role)
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Função para criar log de auditoria facilmente
CREATE OR REPLACE FUNCTION public.create_audit_log(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_module TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_severity TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_user_role TEXT;
    v_changes JSONB;
    v_log_id UUID;
BEGIN
    -- Obter informações do usuário atual
    v_user_id := auth.uid();
    
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;
    
    SELECT role INTO v_user_role
    FROM public.user_roles
    WHERE user_id = v_user_id
    LIMIT 1;
    
    -- Calcular diferenças se tiver old e new values
    IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
        SELECT jsonb_object_agg(key, value)
        INTO v_changes
        FROM jsonb_each(p_new_values)
        WHERE p_old_values->key IS DISTINCT FROM value;
    END IF;
    
    -- Inserir log
    INSERT INTO public.audit_logs (
        user_id, user_email, user_role,
        action, entity_type, entity_id, entity_name,
        old_values, new_values, changes,
        module, description, severity
    ) VALUES (
        v_user_id, v_user_email, v_user_role,
        p_action, p_entity_type, p_entity_id, p_entity_name,
        p_old_values, p_new_values, v_changes,
        p_module, p_description, p_severity
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Trigger genérico para auditoria automática
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_action TEXT;
    v_old_values JSONB;
    v_new_values JSONB;
BEGIN
    -- Determinar ação
    IF TG_OP = 'INSERT' THEN
        v_action := 'create';
        v_new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'update';
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'delete';
        v_old_values := to_jsonb(OLD);
    END IF;
    
    -- Criar log
    PERFORM public.create_audit_log(
        v_action,
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        COALESCE(NEW.name, OLD.name, ''),
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

-- Aplicar trigger nas tabelas principais
DROP TRIGGER IF EXISTS audit_employees ON public.employees;
CREATE TRIGGER audit_employees
    AFTER INSERT OR UPDATE OR DELETE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_teams ON public.teams;
CREATE TRIGGER audit_teams
    AFTER INSERT OR UPDATE OR DELETE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_violation_rules ON public.violation_rules;
CREATE TRIGGER audit_violation_rules
    AFTER INSERT OR UPDATE OR DELETE ON public.violation_rules
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_work_schedules ON public.work_schedules;
CREATE TRIGGER audit_work_schedules
    AFTER INSERT OR UPDATE OR DELETE ON public.work_schedules
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_geofences ON public.geofences;
CREATE TRIGGER audit_geofences
    AFTER INSERT OR UPDATE OR DELETE ON public.geofences
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_webhooks ON public.webhooks;
CREATE TRIGGER audit_webhooks
    AFTER INSERT OR UPDATE OR DELETE ON public.webhooks
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
