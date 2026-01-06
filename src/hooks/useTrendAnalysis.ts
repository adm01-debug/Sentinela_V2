import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrendPoint {
  date: string;
  value: number;
}

export interface Trend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  percentChange: number;
  dataPoints: TrendPoint[];
  prediction?: number;
  confidence: number;
}

export interface UseTrendAnalysisOptions {
  metrics?: string[];
  period?: number;
}

export function useTrendAnalysis(options: UseTrendAnalysisOptions = {}) {
  const { metrics = ['activity', 'violations', 'productivity'], period = 30 } = options;
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzeTrends = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('trend-forecasting', {
        body: { metrics, forecastDays: 7 }
      });
      if (fnError) throw fnError;
      setTrends(data?.forecasts?.map((f: any) => ({
        metric: f.metric,
        direction: f.trend === 'increasing' ? 'up' : f.trend === 'decreasing' ? 'down' : 'stable',
        percentChange: f.predictedValue && f.currentValue ? ((f.predictedValue - f.currentValue) / f.currentValue) * 100 : 0,
        dataPoints: f.dataPoints || [],
        prediction: f.predictedValue,
        confidence: f.confidence,
      })) || []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Analysis failed'));
    } finally {
      setIsLoading(false);
    }
  }, [metrics]);

  const getTrendByMetric = useCallback((metric: string) => trends.find(t => t.metric === metric), [trends]);

  return { trends, isLoading, error, analyzeTrends, getTrendByMetric };
}

export default useTrendAnalysis;
