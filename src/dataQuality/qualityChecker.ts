export interface QualityRule { id: string; name: string; check: (data: any) => boolean; severity: 'info' | 'warning' | 'error'; }
export interface QualityResult { rule: QualityRule; passed: boolean; details?: string; }
export class QualityChecker {
  private rules: QualityRule[] = [];
  addRule(rule: QualityRule): void { this.rules.push(rule); }
  check(data: any): QualityResult[] { return this.rules.map(rule => ({ rule, passed: rule.check(data), details: rule.passed ? undefined : 'Quality check failed' })); }
  getScore(results: QualityResult[]): number { if (results.length === 0) return 100; const passed = results.filter(r => r.passed).length; return (passed / results.length) * 100; }
  getFailures(results: QualityResult[]): QualityResult[] { return results.filter(r => !r.passed); }
}
export const qualityChecker = new QualityChecker();
