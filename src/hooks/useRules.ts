import { useState, useCallback, useMemo } from "react";

interface Rule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export function useRules() {
  const [rules, setRules] = useState<Rule[]>([]);

  const add = useCallback((name: string, condition: string, action: string) => {
    const rule: Rule = { id: crypto.randomUUID(), name, condition, action, enabled: true };
    setRules((prev) => [...prev, rule]);
    return rule;
  }, []);

  const toggle = useCallback((id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }, []);

  const remove = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const enabledRules = useMemo(() => rules.filter((r) => r.enabled), [rules]);

  return { rules, enabledRules, add, toggle, remove };
}
