import { useState, useCallback } from "react";

interface Policy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: string[];
}

export function usePolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);

  const add = useCallback((name: string, description: string, rules: string[] = []) => {
    const policy: Policy = { id: crypto.randomUUID(), name, description, enabled: true, rules };
    setPolicies(prev => [...prev, policy]);
    return policy;
  }, []);

  const toggle = useCallback((id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  }, []);

  const remove = useCallback((id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
  }, []);

  return { policies, add, toggle, remove };
}
