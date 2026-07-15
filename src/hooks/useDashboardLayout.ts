import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys, queryPresets } from '@/lib/queryClient';
import { useState, useCallback, useMemo } from 'react';

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'chart' | 'alerts' | 'employees' | 'ranking' | 'security' | 'custom';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config?: unknown;
  visible?: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export interface DashboardLayout {
  id: string;
  user_id: string;
  widgets: DashboardWidget[];
  created_at: string;
  updated_at: string;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'employees', type: 'employees', title: 'Funcionários', position: { x: 0, y: 0, w: 1, h: 1 }, visible: true, size: 'medium' },
  { id: 'alerts', type: 'alerts', title: 'Alertas', position: { x: 1, y: 0, w: 1, h: 1 }, visible: true, size: 'medium' },
  { id: 'stats', type: 'stats', title: 'Produtividade', position: { x: 2, y: 0, w: 1, h: 1 }, visible: true, size: 'medium' },
  { id: 'activity', type: 'chart', title: 'Atividade', position: { x: 0, y: 1, w: 2, h: 1 }, visible: true, size: 'large' },
];

export function useDashboardLayout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[] | null>(null);

  const query = useQuery({
    queryKey: queryKeys.dashboard.layout(),
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as DashboardLayout | null;
    },
    enabled: !!user?.id,
    ...queryPresets.config,
  });

  const widgets = useMemo(() => {
    if (localWidgets) return localWidgets;
    const data = query.data;
    if (data && Array.isArray(data.widgets)) return data.widgets;
    return DEFAULT_WIDGETS;
  }, [localWidgets, query.data]);

  const saveMutation = useMutation({
    mutationFn: async (newWidgets: DashboardWidget[]) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('dashboard_layouts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('dashboard_layouts')
          .update({ widgets: newWidgets } as Record<string, unknown>)
          .eq('id', (existing as any).id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('dashboard_layouts')
          .insert({ user_id: user.id, widgets: newWidgets })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.layout() });
      setLocalWidgets(null);
    },
  });

  const toggleWidget = useCallback((widgetId: string) => {
    const currentWidgets = localWidgets || widgets;
    const newWidgets = currentWidgets.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    setLocalWidgets(newWidgets);
    saveMutation.mutate(newWidgets);
  }, [widgets, localWidgets, saveMutation]);

  const resizeWidget = useCallback((widgetId: string, size: DashboardWidget['size']) => {
    const currentWidgets = localWidgets || widgets;
    const newWidgets = currentWidgets.map(w =>
      w.id === widgetId ? { ...w, size } : w
    );
    setLocalWidgets(newWidgets);
    saveMutation.mutate(newWidgets);
  }, [widgets, localWidgets, saveMutation]);

  const resetLayout = useCallback(() => {
    setLocalWidgets(DEFAULT_WIDGETS);
    saveMutation.mutate(DEFAULT_WIDGETS);
  }, [saveMutation]);

  return {
    ...query,
    widgets,
    isEditMode,
    setIsEditMode,
    toggleWidget,
    resizeWidget,
    resetLayout,
    saveLayout: saveMutation.mutate,
  };
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
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('dashboard_layouts')
          .update({ widgets })
          .eq('id', (existing as any).id)
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
