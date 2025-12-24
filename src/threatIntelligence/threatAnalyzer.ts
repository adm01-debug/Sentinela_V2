import { ThreatIndicator } from './threatFeed';
export interface ThreatAnalysis { indicator: ThreatIndicator; riskScore: number; relatedIndicators: ThreatIndicator[]; recommendation: string; }
export class ThreatAnalyzer {
  analyze(indicator: ThreatIndicator): ThreatAnalysis { const riskScore = this.calculateRisk(indicator); return { indicator, riskScore, relatedIndicators: [], recommendation: this.getRecommendation(riskScore) }; }
  private calculateRisk(indicator: ThreatIndicator): number { const severityScores = { low: 25, medium: 50, high: 75, critical: 100 }; return severityScores[indicator.severity]; }
  private getRecommendation(riskScore: number): string { if (riskScore >= 75) return 'Block immediately'; if (riskScore >= 50) return 'Monitor closely'; if (riskScore >= 25) return 'Log for review'; return 'Low risk, continue monitoring'; }
  correlate(indicators: ThreatIndicator[]): ThreatIndicator[][] { const groups: ThreatIndicator[][] = []; return groups; }
}
export const threatAnalyzer = new ThreatAnalyzer();
