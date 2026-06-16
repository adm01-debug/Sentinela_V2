export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskLevelMeta {
  level: RiskLevel;
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  icon: string;
}

export function levelFromScore(score: number): RiskLevel {
  if (score >= 76) return "critical";
  if (score >= 51) return "high";
  if (score >= 26) return "medium";
  return "low";
}

export function getLevelMeta(level: RiskLevel): RiskLevelMeta {
  const map: Record<RiskLevel, RiskLevelMeta> = {
    low: {
      level: "low",
      label: "Baixo",
      colorClass: "text-success",
      bgClass: "bg-success/10",
      borderClass: "border-success/30",
      icon: "●",
    },
    medium: {
      level: "medium",
      label: "Médio",
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
      borderClass: "border-warning/30",
      icon: "●",
    },
    high: {
      level: "high",
      label: "Alto",
      colorClass: "text-orange-500",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      icon: "●",
    },
    critical: {
      level: "critical",
      label: "Crítico",
      colorClass: "text-destructive",
      bgClass: "bg-destructive/10",
      borderClass: "border-destructive/30",
      icon: "●",
    },
  };
  return map[level];
}

export const RISK_LEVEL_ORDER: RiskLevel[] = ["low", "medium", "high", "critical"];
