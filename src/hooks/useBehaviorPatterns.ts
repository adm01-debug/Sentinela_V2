import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BehaviorPattern {
  id: string;
  type: 'routine' | 'deviation' | 'trend' | 'anomaly';
  description: string;
  confidence: number;
  frequency: 'daily' | 'weekly' | 'occasional';
  recommendations?: string[];
}

export interface UseBehaviorPatternsOptions {
  /** Nome do funcionário: a edge filtra `keystroke_logs.employee_name`. */
  employeeName?: string;
  analysisPeriod?: number;
}

export function useBehaviorPatterns(options: UseBehaviorPatternsOptions = {}) {
  const { employeeName, analysisPeriod = 30 } = options;
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzePatterns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('behavior-pattern', {
        body: { employeeName, analysisPeriod }
      });
      if (fnError) throw fnError;
      setPatterns(data?.patterns || []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Analysis failed'));
    } finally {
      setIsLoading(false);
    }
  }, [employeeName, analysisPeriod]);

  const getPatternsByType = useCallback((type: BehaviorPattern['type']) => 
    patterns.filter(p => p.type === type), [patterns]);

  const routines = patterns.filter(p => p.type === 'routine');
  const deviations = patterns.filter(p => p.type === 'deviation');
  const anomalies = patterns.filter(p => p.type === 'anomaly');

  return { patterns, routines, deviations, anomalies, isLoading, error, analyzePatterns, getPatternsByType };
}

export default useBehaviorPatterns;
