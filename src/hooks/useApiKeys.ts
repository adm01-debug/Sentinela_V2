import { useState, useCallback } from 'react';
import { apiKeyService } from '@/services/apiKeyService';
import type { ApiKey } from '@/types';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiKeyService.getAll();
      setApiKeys(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const createApiKey = useCallback(async (name: string, scopes: string[]) => {
    const { key, apiKey } = await apiKeyService.create(name, scopes);
    setApiKeys(prev => [...prev, apiKey]);
    return key;
  }, []);

  const revokeApiKey = useCallback(async (id: string) => {
    await apiKeyService.revoke(id);
    setApiKeys(prev => prev.filter(k => k.id !== id));
  }, []);

  return { apiKeys, loading, fetchApiKeys, createApiKey, revokeApiKey };
}
