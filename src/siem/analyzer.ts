import { SecurityEvent, SIEMRule, Severity } from './types';

export class EventAnalyzer {
  private rules: SIEMRule[] = [];
  private correlations: CorrelationRule[] = [];
  
  addRule(rule: SIEMRule): void { this.rules.push(rule); }
  addCorrelation(rule: CorrelationRule): void { this.correlations.push(rule); }
  
  analyze(event: SecurityEvent): AnalysisResult {
    const matchedRules = this.rules.filter(r => r.condition(event));
    const correlations = this.checkCorrelations(event);
    return {
      event,
      matchedRules: matchedRules.map(r => r.id),
      correlations,
      riskScore: this.calculateRiskScore(matchedRules, correlations)
    };
  }
  
  private checkCorrelations(event: SecurityEvent): string[] {
    return this.correlations.filter(c => c.matches(event)).map(c => c.id);
  }
  
  private calculateRiskScore(rules: SIEMRule[], correlations: string[]): number {
    const severityScores: Record<Severity, number> = { low: 1, medium: 3, high: 7, critical: 10 };
    const ruleScore = rules.reduce((sum, r) => sum + severityScores[r.severity], 0);
    return Math.min(100, ruleScore + correlations.length * 5);
  }
}

export interface CorrelationRule { id: string; name: string; matches: (event: SecurityEvent) => boolean; }
export interface AnalysisResult { event: SecurityEvent; matchedRules: string[]; correlations: string[]; riskScore: number; }