import { useState, useCallback } from "react";

interface Violation { id: string; type: string; severity: "low" | "medium" | "high" | "critical"; timestamp: Date; resolved: boolean; }

export function useViolations() {
  const [violations, setViolations] = useState<Violation[]>([]);

  const add = useCallback((type: string, severity: Violation["severity"]) => {
    const violation: Violation = { id: crypto.randomUUID(), type, severity, timestamp: new Date(), resolved: false };
    setViolations(prev => [...prev, violation]);
    return violation;
  }, []);

  const resolve = useCallback((id: string) => {
    setViolations(prev => prev.map(v => v.id === id ? { ...v, resolved: true } : v));
  }, []);

  const unresolved = violations.filter(v => !v.resolved);
  const critical = violations.filter(v => v.severity === "critical" && !v.resolved);

  return { violations, unresolved, critical, add, resolve };
}
