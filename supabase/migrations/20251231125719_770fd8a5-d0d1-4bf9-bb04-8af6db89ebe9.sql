-- Create permissions table for granular permissions
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(module, action)
);

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(role_id, permission_id)
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions
CREATE POLICY "Authenticated users can view permissions"
ON public.permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage permissions"
ON public.permissions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for roles
CREATE POLICY "Authenticated users can view roles"
ON public.roles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage roles"
ON public.roles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for role_permissions
CREATE POLICY "Authenticated users can view role_permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage role_permissions"
ON public.role_permissions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Insert default permissions
INSERT INTO public.permissions (name, module, action, description) VALUES
-- Employees module
('employees.view', 'employees', 'view', 'Visualizar funcionários'),
('employees.create', 'employees', 'create', 'Criar funcionários'),
('employees.edit', 'employees', 'edit', 'Editar funcionários'),
('employees.delete', 'employees', 'delete', 'Excluir funcionários'),
-- Teams module
('teams.view', 'teams', 'view', 'Visualizar equipes'),
('teams.create', 'teams', 'create', 'Criar equipes'),
('teams.edit', 'teams', 'edit', 'Editar equipes'),
('teams.delete', 'teams', 'delete', 'Excluir equipes'),
-- Reports module
('reports.view', 'reports', 'view', 'Visualizar relatórios'),
('reports.export', 'reports', 'export', 'Exportar relatórios'),
('reports.create', 'reports', 'create', 'Criar relatórios'),
-- Violations module
('violations.view', 'violations', 'view', 'Visualizar violações'),
('violations.manage', 'violations', 'manage', 'Gerenciar violações'),
('violations.dismiss', 'violations', 'dismiss', 'Dispensar violações'),
-- Geofences module
('geofences.view', 'geofences', 'view', 'Visualizar geofences'),
('geofences.create', 'geofences', 'create', 'Criar geofences'),
('geofences.edit', 'geofences', 'edit', 'Editar geofences'),
('geofences.delete', 'geofences', 'delete', 'Excluir geofences'),
-- Settings module
('settings.view', 'settings', 'view', 'Visualizar configurações'),
('settings.edit', 'settings', 'edit', 'Editar configurações'),
-- Security module
('security.view', 'security', 'view', 'Visualizar segurança'),
('security.manage', 'security', 'manage', 'Gerenciar segurança'),
-- Users/Roles module
('users.view', 'users', 'view', 'Visualizar usuários'),
('users.create', 'users', 'create', 'Criar usuários'),
('users.edit', 'users', 'edit', 'Editar usuários'),
('users.delete', 'users', 'delete', 'Excluir usuários'),
('roles.view', 'roles', 'view', 'Visualizar roles'),
('roles.create', 'roles', 'create', 'Criar roles'),
('roles.edit', 'roles', 'edit', 'Editar roles'),
('roles.delete', 'roles', 'delete', 'Excluir roles'),
-- Dashboard module
('dashboard.view', 'dashboard', 'view', 'Visualizar dashboard'),
('dashboard.analytics', 'dashboard', 'analytics', 'Ver analytics avançados')
ON CONFLICT (module, action) DO NOTHING;

-- Insert default roles
INSERT INTO public.roles (name, description, is_system) VALUES
('Admin', 'Acesso completo ao sistema', true),
('Manager', 'Gerenciamento de equipes e relatórios', true),
('Analyst', 'Visualização de relatórios e analytics', true),
('User', 'Acesso básico ao sistema', true)
ON CONFLICT (name) DO NOTHING;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(DISTINCT p.name), ARRAY[]::TEXT[])
  FROM user_roles ur
  JOIN roles r ON r.name = ur.role::TEXT
  JOIN role_permissions rp ON rp.role_id = r.id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = _user_id
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.name = ur.role::TEXT
    JOIN role_permissions rp ON rp.role_id = r.id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id
      AND p.name = _permission
  ) OR has_role(_user_id, 'admin')
$$;

-- Trigger for updated_at on roles
CREATE OR REPLACE FUNCTION public.update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON public.roles
FOR EACH ROW
EXECUTE FUNCTION public.update_roles_updated_at();