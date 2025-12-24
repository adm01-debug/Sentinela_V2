export interface ComplianceRule { id: string; name: string; framework: string; check: (data: any) => boolean; severity: 'low' | 'medium' | 'high' | 'critical'; }
export interface ComplianceResult { rule: ComplianceRule; passed: boolean; details?: string; }
export class ComplianceChecker {
  private rules: ComplianceRule[] = [];
  addRule(rule: ComplianceRule): void { this.rules.push(rule); }
  check(data: any): ComplianceResult[] { return this.rules.map(rule => ({ rule, passed: rule.check(data), details: rule.passed ? undefined : 'Compliance violation' })); }
  getByFramework(framework: string): ComplianceRule[] { return this.rules.filter(r => r.framework === framework); }
  getViolations(results: ComplianceResult[]): ComplianceResult[] { return results.filter(r => !r.passed); }
}
export const complianceChecker = new ComplianceChecker();
