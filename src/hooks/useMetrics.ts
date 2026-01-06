import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MetricData { timestamp: Date; value: number; }
interface MetricConfig { name: string; table: string; column: string; aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max'; filters?: Record<string, any>; }

export function useMetrics(configs: MetricConfig[], dateRange?: { from: Date; to: Date }) {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [trends, setTrends] = useState<Record<string, MetricData[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    const results: Record<string, number> = {};
    const trendResults: Record<string, MetricData[]> = {};

    for (const config of configs) {
      try {
        let query = supabase.from(config.table).select(config.column, { count: 'exact' });
        if (config.filters) Object.entries(config.filters).forEach(([k, v]) => { query = query.eq(k, v); });
        if (dateRange) { query = query.gte('created_at', dateRange.from.toISOString()).lte('created_at', dateRange.to.toISOString()); }
        
        const { data, count } = await query;
        if (config.aggregation === 'count') results[config.name] = count || 0;
        else if (data) {
          const values = data.map((d: any) => d[config.column]).filter((v: any) => typeof v === 'number');
          switch (config.aggregation) {
            case 'sum': results[config.name] = values.reduce((a: number, b: number) => a + b, 0); break;
            case 'avg': results[config.name] = values.length ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0; break;
            case 'min': results[config.name] = Math.min(...values); break;
            case 'max': results[config.name] = Math.max(...values); break;
          }
        }
      } catch (e) { console.error(`Metric ${config.name} failed:`, e); }
    }
    setMetrics(results);
  }, [configs, dateRange]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  return { metrics, trends, isLoading, refresh: fetchMetrics };
}
export default useMetrics;
