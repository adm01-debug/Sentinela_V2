import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'chart' | 'alerts' | 'employees' | 'ranking' | 'security' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  visible: boolean;
  order: number;
  config?: Record<string, any>;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'stats-online', type: 'stats', title: 'Colaboradores Online', size: 'small', visible: true, order: 0 },
  { id: 'stats-devices', type: 'stats', title: 'Dispositivos', size: 'small', visible: true, order: 1 },
  { id: 'stats-alerts', type: 'stats', title: 'Alertas Hoje', size: 'small', visible: true, order: 2 },
  { id: 'stats-blocks', type: 'stats', title: 'Bloqueios', size: 'small', visible: true, order: 3 },
  { id: 'chart-activity', type: 'chart', title: 'Gráfico de Atividade', size: 'large', visible: true, order: 4 },
  { id: 'security-metrics', type: 'security', title: 'Métricas de Segurança', size: 'medium', visible: true, order: 5 },
  { id: 'recent-alerts', type: 'alerts', title: 'Alertas Recentes', size: 'medium', visible: true, order: 6 },
  { id: 'active-employees', type: 'employees', title: 'Colaboradores Ativos', size: 'medium', visible: true, order: 7 },
  { id: 'violations-ranking', type: 'ranking', title: 'Ranking de Violações', size: 'medium', visible: true, order: 8 },
];

const STORAGE_KEY = 'sentinela-dashboard-layout';

export function useDashboardLayout() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [isEditMode, setIsEditMode] = useState(false);

  // Carregar layout salvo
  useEffect(() => {
    if (!user?.id) return;
    
    const storageKey = `${STORAGE_KEY}-${user.id}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge com defaults para adicionar novos widgets
        const merged = DEFAULT_WIDGETS.map(defaultWidget => {
          const savedWidget = parsed.find((w: DashboardWidget) => w.id === defaultWidget.id);
          return savedWidget ? { ...defaultWidget, ...savedWidget } : defaultWidget;
        });
        setWidgets(merged);
      } catch (e) {
        console.error('Erro ao carregar layout do dashboard:', e);
      }
    }
  }, [user?.id]);

  // Salvar layout
  const saveLayout = useCallback((newWidgets: DashboardWidget[]) => {
    if (!user?.id) return;
    
    const storageKey = `${STORAGE_KEY}-${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(newWidgets));
    setWidgets(newWidgets);
  }, [user?.id]);

  // Toggle visibilidade
  const toggleWidget = useCallback((widgetId: string) => {
    const newWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Reordenar widgets
  const reorderWidgets = useCallback((fromIndex: number, toIndex: number) => {
    const visibleWidgets = widgets.filter(w => w.visible);
    const [moved] = visibleWidgets.splice(fromIndex, 1);
    visibleWidgets.splice(toIndex, 0, moved);
    
    const newWidgets = widgets.map(w => {
      const visibleIndex = visibleWidgets.findIndex(v => v.id === w.id);
      if (visibleIndex !== -1) {
        return { ...w, order: visibleIndex };
      }
      return w;
    });
    
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Alterar tamanho
  const resizeWidget = useCallback((widgetId: string, size: DashboardWidget['size']) => {
    const newWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, size } : w
    );
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Resetar para padrão
  const resetLayout = useCallback(() => {
    saveLayout(DEFAULT_WIDGETS);
  }, [saveLayout]);

  // Widgets visíveis ordenados
  const visibleWidgets = widgets
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  return {
    widgets,
    visibleWidgets,
    isEditMode,
    setIsEditMode,
    toggleWidget,
    reorderWidgets,
    resizeWidget,
    resetLayout,
  };
}
