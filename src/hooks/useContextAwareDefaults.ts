import { useState, useEffect, useCallback, useMemo } from 'react';

export interface ContextRule<T> {
  condition: () => boolean;
  defaults: Partial<T>;
  priority?: number;
}

export interface UseContextAwareDefaultsOptions<T> {
  baseDefaults: T;
  rules: ContextRule<T>[];
  storageKey?: string;
}

export function useContextAwareDefaults<T extends Record<string, any>>(options: UseContextAwareDefaultsOptions<T>) {
  const { baseDefaults, rules, storageKey } = options;
  const [userOverrides, setUserOverrides] = useState<Partial<T>>(() => {
    if (storageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });

  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(userOverrides));
  }, [storageKey, userOverrides]);

  const contextDefaults = useMemo(() => {
    const applicableRules = rules.filter(r => r.condition()).sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return applicableRules.reduce((acc, rule) => ({ ...acc, ...rule.defaults }), {} as Partial<T>);
  }, [rules]);

  const defaults = useMemo(() => ({ ...baseDefaults, ...contextDefaults, ...userOverrides }), [baseDefaults, contextDefaults, userOverrides]);

  const setOverride = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setUserOverrides(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearOverride = useCallback(<K extends keyof T>(key: K) => {
    setUserOverrides(prev => { const { [key]: _, ...rest } = prev; return rest as Partial<T>; });
  }, []);

  const clearAllOverrides = useCallback(() => setUserOverrides({}), []);

  return { defaults, userOverrides, contextDefaults, setOverride, clearOverride, clearAllOverrides };
}

export default useContextAwareDefaults;
