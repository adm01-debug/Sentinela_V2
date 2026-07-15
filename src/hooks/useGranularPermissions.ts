import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string | null;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

// Fetch all permissions
export function usePermissionsList() {
  return useQuery({
    queryKey: ['permissions-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true })
        .order('action', { ascending: true });

      if (error) throw error;
      return data as Permission[];
    },
  });
}

// Fetch all roles
export function useRolesList() {
  return useQuery({
    queryKey: ['roles-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Role[];
    },
  });
}

// Fetch role permissions
export function useRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];

      const { data, error } = await supabase
        .from('role_permissions')
        .select('*, permission:permissions(*)')
        .eq('role_id', roleId);

      if (error) throw error;
      return data;
    },
    enabled: !!roleId,
  });
}

// Fetch all roles with their permissions
export function useRolesWithPermissions() {
  return useQuery({
    queryKey: ['roles-with-permissions'],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (rolesError) throw rolesError;

      const { data: rolePermissions, error: rpError } = await supabase
        .from('role_permissions')
        .select('role_id, permission:permissions(*)');

      if (rpError) throw rpError;

      const rolesWithPerms: RoleWithPermissions[] = (roles as Role[]).map(role => ({
        ...role,
        permissions: rolePermissions
          .filter((rp: { role_id: string; permission: unknown }) => rp.role_id === role.id)
          .map((rp: { role_id: string; permission: unknown }) => rp.permission as unknown as Permission)
          .filter(Boolean),
      }));

      return rolesWithPerms;
    },
  });
}

// Get permissions grouped by module
export function usePermissionsByModule() {
  const { data: permissions = [] } = usePermissionsList();

  const grouped = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return grouped;
}

// Create role
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { data: role, error } = await supabase
        .from('roles')
        .insert({
          name: data.name,
          description: data.description || null,
          is_system: false,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-list'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
      toast.success('Role criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar role: ' + error.message);
    },
  });
}

// Update role
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string }) => {
      const { data: role, error } = await supabase
        .from('roles')
        .update(data)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-list'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
      toast.success('Role atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar role: ' + error.message);
    },
  });
}

// Delete role
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-list'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
      toast.success('Role excluído com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao excluir role: ' + error.message);
    },
  });
}

// Toggle permission for role
export function useToggleRolePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId, enabled }: { roleId: string; permissionId: string; enabled: boolean }) => {
      if (enabled) {
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role_id: roleId, permission_id: permissionId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId)
          .eq('permission_id', permissionId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar permissão: ' + error.message);
    },
  });
}

// Bulk update role permissions
export function useBulkUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      // Delete all existing permissions for role
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) throw deleteError;

      // Insert new permissions
      if (permissionIds.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(permissionIds.map(pid => ({ role_id: roleId, permission_id: pid })));

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-permissions'] });
      toast.success('Permissões atualizadas com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar permissões: ' + error.message);
    },
  });
}

// Check if current user has permission
export function useHasPermission(permission: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['has-permission', user?.id, permission],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase.rpc('has_permission', {
        _user_id: user.id,
        _permission: permission,
      });

      if (error) {
        logger.error('Permission check error:', error);
        return false;
      }
      return data as boolean;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get current user's permissions
export function useCurrentUserPermissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_user_permissions', {
        _user_id: user.id,
      });

      if (error) {
        logger.error('Get permissions error:', error);
        return [];
      }
      return data as string[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to check multiple permissions
export function useCheckPermissions(permissions: string[]) {
  const { data: userPermissions = [] } = useCurrentUserPermissions();
  
  return {
    hasAll: permissions.every(p => userPermissions.includes(p)),
    hasAny: permissions.some(p => userPermissions.includes(p)),
    check: (permission: string) => userPermissions.includes(permission),
    permissions: userPermissions,
  };
}
