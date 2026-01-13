import { useState, useCallback } from "react";

interface Integration {
  id: string;
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  const add = useCallback((name: string, config?: Record<string, unknown>) => {
    const integration: Integration = {
      id: crypto.randomUUID(),
      name,
      enabled: true,
      config
    };
    setIntegrations(prev => [...prev, integration]);
    return integration;
  }, []);

  const toggle = useCallback((id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
  }, []);

  const remove = useCallback((id: string) => {
    setIntegrations(prev => prev.filter(i => i.id !== id));
  }, []);

  return { integrations, add, toggle, remove };
}
