import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  conditions?: unknown;
}

interface UseFeatureFlagsReturn {
  flags: FeatureFlag[];
  isLoading: boolean;
  error: string | null;
  isEnabled: (flagName) => boolean;
  enableFlag: (flagName) => Promise<void>;
  disableFlag: (flagName) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFeatureFlags(): UseFeatureFlagsReturn {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name');
      
      if (fetchError) throw fetchError;
      setFlags(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feature flags');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const isEnabled = useCallback((flagName): boolean => {
    const flag = flags.find(f => f.name === flagName);
    return flag?.enabled ?? false;
  }, [flags]);

  const enableFlag = useCallback(async (flagName) => {
    const { error } = await supabase
      .from('feature_flags')
      .update({ enabled: true })
      .eq('name', flagName);
    
    if (error) throw error;
    await fetchFlags();
  }, [fetchFlags]);

  const disableFlag = useCallback(async (flagName) => {
    const { error } = await supabase
      .from('feature_flags')
      .update({ enabled: false })
      .eq('name', flagName);
    
    if (error) throw error;
    await fetchFlags();
  }, [fetchFlags]);

  return {
    flags,
    isLoading,
    error,
    isEnabled,
    enableFlag,
    disableFlag,
    refresh: fetchFlags,
  };
}

export default useFeatureFlags;
