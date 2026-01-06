import { useState, useCallback } from 'react';

export interface AIInsight {
  id: string;
  type: 'anomaly' | 'trend' | 'recommendation' | 'warning' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
  actions?: { label: string; action: string }[];
  createdAt: Date;
}

export interface UseAIInsightsOptions {
  fetchInsights: () => Promise<AIInsight[]>;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAIInsights(options: UseAIInsightsOptions) {
  const { fetchInsights, autoRefresh = false, refreshInterval = 60000 } = options;
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInsights();
      setInsights(data.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch insights'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchInsights]);

  const dismissInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  }, []);

  const getInsightsByType = useCallback((type: AIInsight['type']) => insights.filter(i => i.type === type), [insights]);

  const getHighPriorityInsights = useCallback(() => insights.filter(i => i.priority === 'critical' || i.priority === 'high'), [insights]);

  return { insights, isLoading, error, refresh, dismissInsight, getInsightsByType, getHighPriorityInsights, count: insights.length };
}

export default useAIInsights;
