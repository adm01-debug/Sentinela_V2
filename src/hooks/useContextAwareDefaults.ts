import { useMemo, useCallback } from 'react';

export interface ContextRule<T> {
  condition: () => boolean;
  defaults: Partial<T>;
  priority?: number;
}

export interface UseContextAwareDefaultsOptions<T> {
  baseDefaults: T;
  rules: ContextRule<T>[];
}

export function useContextAwareDefaults<T extends Record<string, any>>(options: UseContextAwareDefaultsOptions<T>) {
  const { baseDefaults, rules } = options;

  const computedDefaults = useMemo(() => {
    const sortedRules = [...rules].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    let result = { ...baseDefaults };
    
    for (const rule of sortedRules) {
      if (rule.condition()) {
        result = { ...result, ...rule.defaults };
      }
    }
    
    return result;
  }, [baseDefaults, rules]);

  const getDefault = useCallback(<K extends keyof T>(key: K): T[K] => computedDefaults[key], [computedDefaults]);

  const getDefaults = useCallback((keys: (keyof T)[]): Partial<T> => {
    const result: Partial<T> = {};
    for (const key of keys) result[key] = computedDefaults[key];
    return result;
  }, [computedDefaults]);

  const matchingRules = useMemo(() => rules.filter(r => r.condition()), [rules]);

  return { defaults: computedDefaults, getDefault, getDefaults, matchingRules, rulesApplied: matchingRules.length };
}

export default useContextAwareDefaults;
