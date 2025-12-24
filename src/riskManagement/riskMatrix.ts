import { Risk, RiskLevel } from './riskAssessment';
export interface RiskMatrixCell { likelihood: number; impact: number; level: RiskLevel; risks: Risk[]; }
export class RiskMatrix {
  private matrix: RiskMatrixCell[][] = [];
  constructor() { for (let l = 1; l <= 5; l++) { this.matrix[l] = []; for (let i = 1; i <= 5; i++) { const score = l * i; let level: RiskLevel = 'negligible'; if (score >= 20) level = 'critical'; else if (score >= 15) level = 'high'; else if (score >= 10) level = 'medium'; else if (score >= 5) level = 'low'; this.matrix[l][i] = { likelihood: l, impact: i, level, risks: [] }; } } }
  addRisk(risk: Risk): void { this.matrix[risk.likelihood][risk.impact].risks.push(risk); }
  getCell(likelihood: number, impact: number): RiskMatrixCell { return this.matrix[likelihood][impact]; }
  getHighRiskCells(): RiskMatrixCell[] { const result: RiskMatrixCell[] = []; for (let l = 1; l <= 5; l++) { for (let i = 1; i <= 5; i++) { if (['high', 'critical'].includes(this.matrix[l][i].level)) result.push(this.matrix[l][i]); } } return result; }
}
export const riskMatrix = new RiskMatrix();
