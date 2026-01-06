import { useState, useEffect, useCallback } from "react";

type ThreatLevel = "none" | "low" | "medium" | "high" | "critical";

interface ThreatIndicator {
  id: string;
  type: string;
  severity: ThreatLevel;
  message: string;
  timestamp: Date;
}

export function useThreatLevel() {
  const [level, setLevel] = useState<ThreatLevel>("none");
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const addIndicator = useCallback((indicator: Omit<ThreatIndicator, "id" | "timestamp">) => {
    const newIndicator: ThreatIndicator = { ...indicator, id: crypto.randomUUID(), timestamp: new Date() };
    setIndicators((prev) => [...prev, newIndicator].slice(-50));
  }, []);

  const clearIndicator = useCallback((id: string) => {
    setIndicators((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => setIndicators([]), []);

  useEffect(() => {
    if (!isMonitoring) return;
    const severityOrder: ThreatLevel[] = ["none", "low", "medium", "high", "critical"];
    const maxSeverity = indicators.reduce((max, ind) => {
      const current = severityOrder.indexOf(ind.severity);
      const maxIndex = severityOrder.indexOf(max);
      return current > maxIndex ? ind.severity : max;
    }, "none" as ThreatLevel);
    setLevel(maxSeverity);
  }, [indicators, isMonitoring]);

  const pause = useCallback(() => setIsMonitoring(false), []);
  const resume = useCallback(() => setIsMonitoring(true), []);

  return { level, indicators, addIndicator, clearIndicator, clearAll, isMonitoring, pause, resume };
}

export default useThreatLevel;
