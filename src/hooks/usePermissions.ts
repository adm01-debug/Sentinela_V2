import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys, queryPresets } from '@/lib/queryClient';

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface UsePermissionsReturn {
  permissions: string[];
  isLoading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refresh: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();
  
  const { data: permissionsRaw, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.permissions.user(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role:roles(permissions)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const perms = new Set<string>();
      data?.forEach((ur: { role?: { permissions?: string[] } }) => {
        const role = ur.role as { permissions?: string[] } | null;
        role?.permissions?.forEach((p: string) => perms.add(p));
      });
      
      return Array.from(perms);
    },
    enabled: !!user?.id,
    ...queryPresets.config,
  });

  const permissions = Array.isArray(permissionsRaw) ? (permissionsRaw as string[]) : [];

  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.includes(permission) || permissions.includes('admin') || permissions.includes('*');
  }, [permissions]);

  const hasAnyPermission = useCallback((perms: string[]): boolean => {
    if (permissions.includes('admin') || permissions.includes('*')) return true;
    return perms.some(p => permissions.includes(p));
  }, [permissions]);

  const hasAllPermissions = useCallback((perms: string[]): boolean => {
    if (permissions.includes('admin') || permissions.includes('*')) return true;
    return perms.every(p => permissions.includes(p));
  }, [permissions]);

  return {
    permissions,
    isLoading,
    error: error?.message || null,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refresh: async () => { await refetch(); },
  };
}

export function useUserPermissions() {
  const { permissions, isLoading, error } = usePermissions();
  return { data: permissions, isLoading, error };
}

export function useHasPermission(permission: string) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.permissions.roles(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as UserRole[];
    },
    ...queryPresets.config,
  });
}

export default usePermissions;
