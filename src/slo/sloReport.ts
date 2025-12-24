import { sloDefinition, SLO } from './sloDefinition';
import { sloCalculator, SLOResult } from './sloCalculator';
export interface SLOReport { generatedAt: Date; period: string; results: SLOResult[]; summary: { total: number; met: number; violated: number }; }
export function generateSLOReport(period: string, getData: (slo: SLO) => { total: number; successful: number }): SLOReport { const slos = sloDefinition.list(); const results = slos.map(slo => sloCalculator.calculate(slo, getData(slo))); return { generatedAt: new Date(), period, results, summary: { total: results.length, met: results.filter(r => r.met).length, violated: results.filter(r => !r.met).length } }; }
