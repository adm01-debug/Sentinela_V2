import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AppConfig {
  id: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  allowedIPs?: string[];
  maxUploadSize: number;
  sessionTimeout: number;
  mfaRequired: boolean;
  defaultLanguage: string;
  supportedLanguages: string[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  features: Record<string, boolean>;
}

interface UseAppConfigReturn {
  config: AppConfig | null;
  isLoading: boolean;
  error: string | null;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultConfig: AppConfig = {
  id: 'default',
  maintenanceMode: false,
  maxUploadSize: 10485760, // 10MB
  sessionTimeout: 3600,
  mfaRequired: false,
  defaultLanguage: 'pt-BR',
  supportedLanguages: ['pt-BR', 'en', 'es'],
  theme: {
    primaryColor: '#1890ff',
    secondaryColor: '#52c41a',
  },
  features: {},
};

export function useAppConfig(): UseAppConfigReturn {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await (supabase as any)
        .from('app_config')
        .select('*')
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      setConfig(data as AppConfig || defaultConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch app config');
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(async (updates: Partial<AppConfig>) => {
    const { error } = await (supabase as any)
      .from('app_config')
      .upsert({ ...config, ...updates });
    
    if (error) throw error;
    await fetchConfig();
  }, [config, fetchConfig]);

  return {
    config,
    isLoading,
    error,
    updateConfig,
    refresh: fetchConfig,
  };
}

export default useAppConfig;
