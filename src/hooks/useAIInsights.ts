import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AIInsightType = 'anomaly' | 'trend' | 'recommendation' | 'prediction';

export interface AIInsight {
  id: string;
  type: AIInsightType;
  title: string;
  description: string;
  confidence: number;
  severity?: 'low' | 'medium' | 'high';
  data?: Record<string, string | number | boolean>;
  actions?: string[];
  createdAt: Date;
}

export interface AIInsightsMetadata {
  analyzedActivities: number;
  analyzedViolations: number;
  analyzedEmployees: number;
  generatedAt: string;
}

export interface UseAIInsightsOptions {
  /** Tipos pedidos a `generate-insights`. Sem isso a function usa trend, anomaly e recommendation. */
  insightTypes?: AIInsightType[];
}

interface RawInsight extends Omit<AIInsight, 'createdAt'> {
  createdAt?: string;
}

export function useAIInsights(options: UseAIInsightsOptions = {}) {
  const { insightTypes } = options;
  const insightTypesKey = insightTypes?.join(',');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [metadata, setMetadata] = useState<AIInsightsMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const types = insightTypesKey ? (insightTypesKey.split(',') as AIInsightType[]) : undefined;
      const { data, error: fnError } = await supabase.functions.invoke('generate-insights', {
        body: { insightTypes: types },
      });
      if (fnError) throw fnError;
      const raw: RawInsight[] = Array.isArray(data?.insights) ? data.insights : [];
      setInsights(
        raw.map((insight) => ({
          ...insight,
          createdAt: insight.createdAt ? new Date(insight.createdAt) : new Date(),
        }))
      );
      setMetadata((data?.metadata as AIInsightsMetadata | undefined) ?? null);
    } catch (e) {
      setInsights([]);
      setMetadata(null);
      setError(e instanceof Error ? e : new Error('Failed to fetch insights'));
    } finally {
      setIsLoading(false);
    }
  }, [insightTypesKey]);

  const dismissInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  }, []);

  const getInsightsByType = useCallback((type: AIInsight['type']) => insights.filter(i => i.type === type), [insights]);

  return { insights, metadata, isLoading, error, fetchInsights, dismissInsight, getInsightsByType, anomalies: getInsightsByType('anomaly'), recommendations: getInsightsByType('recommendation') };
}

export default useAIInsights;
