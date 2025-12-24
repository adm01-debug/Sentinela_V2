import { ScanResult } from './types';

export class ScanReporter {
  generateReport(results: ScanResult[]): ScanReport {
    const allVulns = results.flatMap(r => r.vulnerabilities);
    return {
      summary: { total: allVulns.length, critical: allVulns.filter(v => v.severity === 'critical').length, high: allVulns.filter(v => v.severity === 'high').length, medium: allVulns.filter(v => v.severity === 'medium').length, low: allVulns.filter(v => v.severity === 'low').length },
      avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      results,
      generatedAt: new Date()
    };
  }
  
  toJSON(report: ScanReport): string { return JSON.stringify(report, null, 2); }
  toHTML(report: ScanReport): string { return '<html><body><h1>Security Report</h1><p>Score: ' + report.avgScore.toFixed(1) + '</p></body></html>'; }
}

export interface ScanReport { summary: { total: number; critical: number; high: number; medium: number; low: number }; avgScore: number; results: ScanResult[]; generatedAt: Date; }