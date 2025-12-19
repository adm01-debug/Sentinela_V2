import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'viewer' | 'supervisor' | 'manager' | 'admin' | 'super_admin';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export';

export interface Permission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
}

export interface UserPermissions {
  role: UserRole;
  permissions: Permission[];
  teamScope: string[];
  departmentScope: string[];
}

async function fetchUserPermissions(userId: string): Promise<UserPermissions | null> {
  // Buscar role do usuário
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role, team_scope, department_scope')
    .eq('user_id', userId)
    .single();

  if (roleError || !roleData) {
    console.error('Erro ao buscar role:', roleError);
    return null;
  }

  // Buscar permissões da role
  const { data: permissions, error: permError } = await supabase
    .from('role_permissions')
    .select('module, can_view, can_create, can_edit, can_delete, can_export')
    .eq('role', roleData.role);

  if (permError) {
    console.error('Erro ao buscar permissões:', permError);
    return null;
  }

  return {
    role: roleData.role as UserRole,
    permissions: permissions || [],
    teamScope: roleData.team_scope || [],
    departmentScope: roleData.department_scope || [],
  };
}

export function usePermissions() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: () => fetchUserPermissions(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Helper para verificar permissão
  const hasPermission = (module: string, action: PermissionAction = 'view'): boolean => {
    if (!data) return false;
    
    // Super admin tem acesso total
    if (data.role === 'super_admin') return true;
    
    const perm = data.permissions.find(p => p.module === module);
    if (!perm) return false;
    
    switch (action) {
      case 'view': return perm.can_view;
      case 'create': return perm.can_create;
      case 'edit': return perm.can_edit;
      case 'delete': return perm.can_delete;
      case 'export': return perm.can_export;
      default: return false;
    }
  };

  // Helper para verificar se é pelo menos um role
  const hasRole = (...roles: UserRole[]): boolean => {
    if (!data) return false;
    return roles.includes(data.role);
  };

  // Helper para verificar acesso a uma equipe
  const hasTeamAccess = (teamId: string): boolean => {
    if (!data) return false;
    if (data.role === 'super_admin' || data.role === 'admin') return true;
    return data.teamScope.includes(teamId);
  };

  // Helper para verificar acesso a um departamento
  const hasDepartmentAccess = (department: string): boolean => {
    if (!data) return false;
    if (data.role === 'super_admin' || data.role === 'admin') return true;
    return data.departmentScope.includes(department);
  };

  return {
    permissions: data,
    role: data?.role,
    isLoading,
    error,
    hasPermission,
    hasRole,
    hasTeamAccess,
    hasDepartmentAccess,
    // Shortcuts comuns
    canView: (module: string) => hasPermission(module, 'view'),
    canCreate: (module: string) => hasPermission(module, 'create'),
    canEdit: (module: string) => hasPermission(module, 'edit'),
    canDelete: (module: string) => hasPermission(module, 'delete'),
    canExport: (module: string) => hasPermission(module, 'export'),
    isViewer: hasRole('viewer'),
    isSupervisor: hasRole('supervisor', 'manager', 'admin', 'super_admin'),
    isManager: hasRole('manager', 'admin', 'super_admin'),
    isAdmin: hasRole('admin', 'super_admin'),
    isSuperAdmin: hasRole('super_admin'),
  };
}
