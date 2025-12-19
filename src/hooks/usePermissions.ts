import { useQuery } from '@tanstack/react-query';
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

export function useUserPermissions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.permissions.user(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role:roles(permissions)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const permissions = new Set<string>();
      data?.forEach(ur => {
        (ur.role as any)?.permissions?.forEach((p: string) => permissions.add(p));
      });
      
      return Array.from(permissions);
    },
    enabled: !!user?.id,
    ...queryPresets.config,
  });
}

export function useHasPermission(permission: string) {
  const { data: permissions = [] } = useUserPermissions();
  return permissions.includes(permission) || permissions.includes('admin');
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
