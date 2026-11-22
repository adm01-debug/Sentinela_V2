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

type AppConfigRow = {
  id: string;
  maintenance_mode?: boolean | null;
  maintenance_message?: string | null;
  allowed_ips?: string[] | null;
  max_upload_size?: number | null;
  session_timeout?: number | null;
  mfa_required?: boolean | null;
  default_language?: string | null;
  supported_languages?: string[] | null;
  theme?: { primaryColor?: string; secondaryColor?: string } | null;
  features?: Record<string, boolean> | null;
};

// O banco usa snake_case; o hook expoe camelCase. Sem o mapeamento todo
// campo lido do config vinha undefined (o `as AppConfig` so escondia o tipo).
function rowToConfig(row: AppConfigRow): AppConfig {
  return {
    id: row.id,
    maintenanceMode: row.maintenance_mode ?? false,
    maintenanceMessage: row.maintenance_message ?? undefined,
    allowedIPs: row.allowed_ips ?? undefined,
    maxUploadSize: row.max_upload_size ?? 10485760,
    sessionTimeout: row.session_timeout ?? 3600,
    mfaRequired: row.mfa_required ?? false,
    defaultLanguage: row.default_language ?? 'pt-BR',
    supportedLanguages: row.supported_languages ?? ['pt-BR', 'en', 'es'],
    theme: {
      primaryColor: row.theme?.primaryColor ?? '#1890ff',
      secondaryColor: row.theme?.secondaryColor ?? '#52c41a',
    },
    features: row.features ?? {},
  };
}

function configToRow(config: Partial<AppConfig>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  // defaultConfig.id e 'default' (nao-uuid): enviar isso no upsert quebra o insert.
  if (config.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.id)) row.id = config.id;
  if (config.maintenanceMode !== undefined) row.maintenance_mode = config.maintenanceMode;
  if (config.maintenanceMessage !== undefined) row.maintenance_message = config.maintenanceMessage;
  if (config.allowedIPs !== undefined) row.allowed_ips = config.allowedIPs;
  if (config.maxUploadSize !== undefined) row.max_upload_size = config.maxUploadSize;
  if (config.sessionTimeout !== undefined) row.session_timeout = config.sessionTimeout;
  if (config.mfaRequired !== undefined) row.mfa_required = config.mfaRequired;
  if (config.defaultLanguage !== undefined) row.default_language = config.defaultLanguage;
  if (config.supportedLanguages !== undefined) row.supported_languages = config.supportedLanguages;
  if (config.theme !== undefined) row.theme = config.theme;
  if (config.features !== undefined) row.features = config.features;
  return row;
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
      
      const { data, error: fetchError } = await supabase
        .from('app_config')
        .select('*')
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      setConfig(data ? rowToConfig(data as AppConfigRow) : defaultConfig);
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
    const merged = { ...(config ?? defaultConfig), ...updates };
    const { error } = await supabase
      .from('app_config')
      .upsert(configToRow(merged) as never);
    
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
