import { checkSOC2Compliance } from './soc2Rules';
import { checkISO27001Compliance } from './iso27001Rules';
export type ComplianceFramework = 'soc2' | 'iso27001' | 'all';
export interface ComplianceResult { framework: string; passed: number; failed: number; percentage: number; }
export function checkCompliance(framework: ComplianceFramework = 'all'): ComplianceResult[] {
  const results: ComplianceResult[] = [];
  if (framework === 'soc2' || framework === 'all') { const soc2 = checkSOC2Compliance(); results.push({ framework: 'SOC2', passed: soc2.passed, failed: soc2.failed, percentage: (soc2.passed / (soc2.passed + soc2.failed)) * 100 }); }
  if (framework === 'iso27001' || framework === 'all') { const iso = checkISO27001Compliance(); results.push({ framework: 'ISO27001', passed: iso.passed, failed: iso.failed, percentage: (iso.passed / (iso.passed + iso.failed)) * 100 }); }
  return results;
}
