import { useMemo } from "react";

export type ThreatLevel = "low" | "medium" | "high" | "critical";

export interface ThreatIndicator {
  id: string;
  type: string;
  severity: number;
  timestamp: Date;
  description?: string;
}

export interface UseThreatLevelOptions {
  indicators: ThreatIndicator[];
  thresholds?: { medium: number; high: number; critical: number };
}

export function useThreatLevel(options: UseThreatLevelOptions) {
  const { indicators, thresholds = { medium: 30, high: 60, critical: 80 } } = options;

  const { level, score, recentThreats, criticalCount } = useMemo(() => {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const recentThreats = indicators.filter((i) => i.timestamp.getTime() > hourAgo);
    const score = recentThreats.reduce((sum, i) => sum + i.severity, 0);
    const criticalCount = recentThreats.filter((i) => i.severity >= 80).length;
    let level: ThreatLevel = "low";
    if (score >= thresholds.critical || criticalCount > 0) level = "critical";
    else if (score >= thresholds.high) level = "high";
    else if (score >= thresholds.medium) level = "medium";
    return { level, score, recentThreats, criticalCount };
  }, [indicators, thresholds]);

  const color = useMemo(() => {
    const colors = { low: "green", medium: "yellow", high: "orange", critical: "red" };
    return colors[level];
  }, [level]);

  return { level, score, color, recentThreats, criticalCount, totalIndicators: indicators.length };
}

export default useThreatLevel;
