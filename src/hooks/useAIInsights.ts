import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIInsight {
  id: string;
  type: 'anomaly' | 'trend' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  severity?: 'low' | 'medium' | 'high';
  actionable?: boolean;
  data?: Record<string, string | number | boolean>;
  createdAt: Date;
}

export interface UseAIInsightsOptions {
  entityType?: string;
  entityId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAIInsights(options: UseAIInsightsOptions = {}) {
  const { entityType, entityId } = options;
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-activity', {
        body: { entityType, entityId, type: 'insights' }
      });
      if (fnError) throw fnError;
      setInsights(data?.insights?.map((i: any) => ({ ...i, createdAt: new Date(i.createdAt) })) || []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch insights'));
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  const dismissInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  }, []);

  const getInsightsByType = useCallback((type: AIInsight['type']) => insights.filter(i => i.type === type), [insights]);

  return { insights, isLoading, error, fetchInsights, dismissInsight, getInsightsByType, anomalies: getInsightsByType('anomaly'), recommendations: getInsightsByType('recommendation') };
}

export default useAIInsights;
