import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Baseline {
  id: string;
  employee_id: string;
  feature_name: string;
  mean: number;
  std_dev: number;
  min_value: number;
  max_value: number;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  sample_size: number;
  period_days: number;
  insufficient_data: boolean;
  computed_at: string;
}

export function useBehavioralBaseline(employeeId?: string) {
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const { data, error: e } = await supabase
          .from('behavioral_baselines')
          .select('*')
          .eq('employee_id', employeeId);
        if (e) throw e;
        if (mounted) setBaselines((data as unknown as Baseline[]) || []);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e : new Error('Failed to load baseline'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [employeeId]);

  return { baselines, loading, error };
}
