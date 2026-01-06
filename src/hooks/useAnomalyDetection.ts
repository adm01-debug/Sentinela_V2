import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UseAnomalyDetectionOptions {
  entityType?: string;
  threshold?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAnomalyDetection(options: UseAnomalyDetectionOptions = {}) {
  const { entityType, threshold = 0.7, autoRefresh = false, refreshInterval = 60000 } = options;
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const detectAnomalies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('predict-anomaly', {
        body: { entityType, threshold, timeRange: '24h' }
      });
      if (fnError) throw fnError;
      setAnomalies(data?.predictions?.map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp)
      })) || []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Detection failed'));
    } finally {
      setIsLoading(false);
    }
  }, [entityType, threshold]);

  const dismissAnomaly = useCallback((id: string) => {
    setAnomalies(prev => prev.filter(a => a.id !== id));
  }, []);

  const criticalCount = useMemo(() => anomalies.filter(a => a.severity === 'critical').length, [anomalies]);
  const highCount = useMemo(() => anomalies.filter(a => a.severity === 'high').length, [anomalies]);

  return { anomalies, isLoading, error, detectAnomalies, dismissAnomaly, criticalCount, highCount };
}

export default useAnomalyDetection;
