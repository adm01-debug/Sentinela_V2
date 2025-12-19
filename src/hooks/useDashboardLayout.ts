import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys, queryPresets } from '@/lib/queryClient';

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config?: Record<string, unknown>;
}

export interface DashboardLayout {
  id: string;
  user_id: string;
  widgets: DashboardWidget[];
  created_at: string;
  updated_at: string;
}

export function useDashboardLayout() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard.layout(),
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as DashboardLayout | null;
    },
    enabled: !!user?.id,
    ...queryPresets.config,
  });
}

export function useSaveDashboardLayout() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (widgets: DashboardWidget[]) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('dashboard_layouts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('dashboard_layouts')
          .update({ widgets })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('dashboard_layouts')
          .insert({ user_id: user.id, widgets })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.layout() });
    },
  });
}
