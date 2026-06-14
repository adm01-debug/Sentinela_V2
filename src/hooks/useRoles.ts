import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Role {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  permissions: string[];
  userCount: number;
}

export function useRoles(userRoles: string[] = []) {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      const { data: rolesData, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      if (error) throw error;

      // Get permissions for each role
      const roles: Role[] = [];
      for (const role of rolesData ?? []) {
        const { data: rolePerms } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .eq('role_id', role.id);

        const permissionIds = (rolePerms ?? []).map((rp) => rp.permission_id);
        let permissionNames: string[] = [];

        if (permissionIds.length > 0) {
          const { data: perms } = await supabase
            .from('permissions')
            .select('name')
            .in('id', permissionIds);
          permissionNames = (perms ?? []).map((p: any) => p.name);
        }

        // Count users with this role
        const { count } = await supabase
          .from('user_roles')
          .select('id', { count: 'exact', head: true })
          .eq('role', role.name);

        roles.push({
          id: role.id,
          name: role.name,
          description: role.description,
          is_active: role.is_active ?? true,
          created_at: role.created_at,
          permissions: permissionNames,
          userCount: count ?? 0,
        });
      }

      return roles;
    },
    staleTime: 60_000,
  });

  const hasRole = useCallback((roleName: string) => {
    return userRoles.includes(roleName);
  }, [userRoles]);

  const hasPermission = useCallback((permission: string) => {
    const roles = rolesQuery.data ?? [];
    return roles.some(r => userRoles.includes(r.name) && r.permissions.includes(permission));
  }, [rolesQuery.data, userRoles]);

  return {
    roles: rolesQuery.data ?? [],
    hasRole,
    hasPermission,
    isLoading: rolesQuery.isLoading,
    error: rolesQuery.error,
    refetch: rolesQuery.refetch,
  };
}
