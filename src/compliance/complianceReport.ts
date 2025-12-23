import { checkCompliance, ComplianceResult } from './complianceChecker';
export interface ComplianceReport { generatedAt: string; results: ComplianceResult[]; overallScore: number; recommendations: string[]; }
export function generateComplianceReport(): ComplianceReport {
  const results = checkCompliance('all');
  const overallScore = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
  const recommendations: string[] = [];
  results.forEach(r => { if (r.failed > 0) recommendations.push('Review ' + r.framework + ' controls: ' + r.failed + ' failing'); });
  return { generatedAt: new Date().toISOString(), results, overallScore, recommendations };
}
