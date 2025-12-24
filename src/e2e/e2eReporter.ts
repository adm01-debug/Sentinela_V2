import { E2EResult } from './e2eRunner';
export class E2EReporter {
  generateReport(results: E2EResult[]): string { const passed = results.filter(r => r.passed).length; const failed = results.length - passed; let report = '# E2E Test Report\n\n'; report += '## Summary\n'; report += '- Total: ' + results.length + '\n'; report += '- Passed: ' + passed + '\n'; report += '- Failed: ' + failed + '\n\n'; report += '## Results\n'; results.forEach(r => { report += '- ' + (r.passed ? '✅' : '❌') + ' ' + r.name + ' (' + r.duration + 'ms)\n'; if (r.error) report += '  Error: ' + r.error + '\n'; }); return report; }
  printConsole(results: E2EResult[]): void { console.log(this.generateReport(results)); }
}
export const e2eReporter = new E2EReporter();
