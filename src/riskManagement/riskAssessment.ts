export type RiskLevel = 'negligible' | 'low' | 'medium' | 'high' | 'critical';
export interface Risk { id: string; name: string; description: string; likelihood: number; impact: number; level: RiskLevel; category: string; owner?: string; }
export class RiskAssessment {
  private risks: Risk[] = [];
  assess(name: string, description: string, likelihood: number, impact: number, category: string): Risk { const score = likelihood * impact; const level = this.calculateLevel(score); const risk: Risk = { id: crypto.randomUUID(), name, description, likelihood, impact, level, category }; this.risks.push(risk); return risk; }
  private calculateLevel(score: number): RiskLevel { if (score >= 20) return 'critical'; if (score >= 15) return 'high'; if (score >= 10) return 'medium'; if (score >= 5) return 'low'; return 'negligible'; }
  getRisks(): Risk[] { return [...this.risks]; }
  getByLevel(level: RiskLevel): Risk[] { return this.risks.filter(r => r.level === level); }
}
export const riskAssessment = new RiskAssessment();
