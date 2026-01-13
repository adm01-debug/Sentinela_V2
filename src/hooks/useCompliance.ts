import { useState, useCallback } from "react";

interface ComplianceRule {
  id: string;
  name: string;
  status: "compliant" | "non-compliant" | "pending";
  lastChecked?: Date;
}

export function useCompliance() {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [checking, setChecking] = useState(false);

  const checkCompliance = useCallback(async () => {
    setChecking(true);
    setRules(prev => prev.map(r => ({ ...r, lastChecked: new Date() })));
    setChecking(false);
  }, []);

  const addRule = useCallback((name: string) => {
    const rule: ComplianceRule = { id: crypto.randomUUID(), name, status: "pending" };
    setRules(prev => [...prev, rule]);
  }, []);

  const isCompliant = rules.every(r => r.status === "compliant");

  return { rules, checking, isCompliant, checkCompliance, addRule };
}
