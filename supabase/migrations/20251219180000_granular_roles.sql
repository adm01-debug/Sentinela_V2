-- =============================================
-- SISTEMA DE ROLES GRANULAR
-- =============================================

-- Criar enum para roles
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('viewer', 'supervisor', 'manager', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de permissões por módulo
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    role user_role_type NOT NULL,
    module TEXT NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT false,
    can_create BOOLEAN NOT NULL DEFAULT false,
    can_edit BOOLEAN NOT NULL DEFAULT false,
    can_delete BOOLEAN NOT NULL DEFAULT false,
    can_export BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(role, module)
);

-- Habilitar RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Política de leitura (todos autenticados podem ler)
CREATE POLICY "Users can view role permissions" 
ON public.role_permissions 
FOR SELECT 
TO authenticated
USING (true);

-- Apenas super_admin pode modificar permissões
CREATE POLICY "Only super_admin can modify permissions" 
ON public.role_permissions 
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
);

-- Atualizar tabela user_roles para usar o novo tipo
ALTER TABLE public.user_roles 
    ALTER COLUMN role TYPE TEXT;

-- Adicionar coluna de scope (para supervisores/managers de equipes específicas)
ALTER TABLE public.user_roles 
    ADD COLUMN IF NOT EXISTS team_scope UUID[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS department_scope TEXT[] DEFAULT '{}';

-- Inserir permissões padrão por role
INSERT INTO public.role_permissions (role, module, can_view, can_create, can_edit, can_delete, can_export) VALUES
-- VIEWER: Apenas visualização básica
('viewer', 'dashboard', true, false, false, false, false),
('viewer', 'employees', true, false, false, false, false),
('viewer', 'reports', true, false, false, false, false),

-- SUPERVISOR: Visualização + alguns relatórios
('supervisor', 'dashboard', true, false, false, false, true),
('supervisor', 'employees', true, false, false, false, true),
('supervisor', 'monitoring', true, false, false, false, false),
('supervisor', 'violations', true, false, false, false, true),
('supervisor', 'reports', true, false, false, false, true),
('supervisor', 'productivity', true, false, false, false, true),

-- MANAGER: CRUD em sua equipe
('manager', 'dashboard', true, false, false, false, true),
('manager', 'employees', true, true, true, false, true),
('manager', 'teams', true, true, true, false, true),
('manager', 'monitoring', true, false, false, false, true),
('manager', 'violations', true, true, true, false, true),
('manager', 'reports', true, true, false, false, true),
('manager', 'work_schedules', true, true, true, false, true),
('manager', 'productivity', true, false, false, false, true),

-- ADMIN: Quase tudo, exceto configurações críticas
('admin', 'dashboard', true, true, true, true, true),
('admin', 'employees', true, true, true, true, true),
('admin', 'teams', true, true, true, true, true),
('admin', 'devices', true, true, true, true, true),
('admin', 'monitoring', true, true, true, false, true),
('admin', 'violations', true, true, true, true, true),
('admin', 'violation_rules', true, true, true, true, true),
('admin', 'reports', true, true, true, true, true),
('admin', 'work_schedules', true, true, true, true, true),
('admin', 'geofencing', true, true, true, true, true),
('admin', 'internet_access', true, true, true, true, true),
('admin', 'webhooks', true, true, true, true, true),
('admin', 'whatsapp', true, true, true, true, true),
('admin', 'productivity', true, true, true, true, true),

-- SUPER_ADMIN: Acesso total
('super_admin', 'dashboard', true, true, true, true, true),
('super_admin', 'employees', true, true, true, true, true),
('super_admin', 'teams', true, true, true, true, true),
('super_admin', 'devices', true, true, true, true, true),
('super_admin', 'monitoring', true, true, true, true, true),
('super_admin', 'violations', true, true, true, true, true),
('super_admin', 'violation_rules', true, true, true, true, true),
('super_admin', 'reports', true, true, true, true, true),
('super_admin', 'settings', true, true, true, true, true),
('super_admin', 'work_schedules', true, true, true, true, true),
('super_admin', 'geofencing', true, true, true, true, true),
('super_admin', 'internet_access', true, true, true, true, true),
('super_admin', 'webhooks', true, true, true, true, true),
('super_admin', 'whatsapp', true, true, true, true, true),
('super_admin', 'agent_keys', true, true, true, true, true),
('super_admin', 'rate_limiting', true, true, true, true, true),
('super_admin', 'user_management', true, true, true, true, true),
('super_admin', 'audit_logs', true, true, true, true, true),
('super_admin', 'productivity', true, true, true, true, true)
ON CONFLICT (role, module) DO NOTHING;

-- Função para verificar permissão
CREATE OR REPLACE FUNCTION public.check_permission(
    p_user_id UUID,
    p_module TEXT,
    p_action TEXT DEFAULT 'view'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role TEXT;
    v_has_permission BOOLEAN := false;
BEGIN
    -- Buscar role do usuário
    SELECT role INTO v_role
    FROM public.user_roles
    WHERE user_id = p_user_id
    LIMIT 1;
    
    IF v_role IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verificar permissão
    SELECT 
        CASE p_action
            WHEN 'view' THEN can_view
            WHEN 'create' THEN can_create
            WHEN 'edit' THEN can_edit
            WHEN 'delete' THEN can_delete
            WHEN 'export' THEN can_export
            ELSE false
        END INTO v_has_permission
    FROM public.role_permissions
    WHERE role = v_role::user_role_type AND module = p_module;
    
    RETURN COALESCE(v_has_permission, false);
END;
$$;
