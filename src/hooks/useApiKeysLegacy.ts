import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('agent_keys').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setApiKeys(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const createApiKey = useCallback(async (name: string, _scopes: string[]) => {
    const key = crypto.randomUUID();
    const { data, error } = await supabase.from('agent_keys').insert({ key_name: name, agent_key: key }).select().single();
    if (error) throw error;
    setApiKeys(prev => [...prev, data]);
    return key;
  }, []);

  const revokeApiKey = useCallback(async (id: string) => {
    const { error } = await supabase.from('agent_keys').update({ is_active: false }).eq('id', id);
    if (error) throw error;
    setApiKeys(prev => prev.filter(k => k.id !== id));
  }, []);

  return { apiKeys, loading, fetchApiKeys, createApiKey, revokeApiKey };
}
