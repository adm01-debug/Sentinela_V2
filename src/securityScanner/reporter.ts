import { ScanResult, Vulnerability } from './types';

export class ScanReporter {
  generateReport(result: ScanResult): ScanReport {
    const bySeverity = this.groupBySeverity(result.vulnerabilities);
    return {
      summary: { scanId: result.scanId, target: result.target, score: result.score, totalVulnerabilities: result.vulnerabilities.length, duration: result.completedAt.getTime() - result.startedAt.getTime() },
      bySeverity,
      recommendations: this.getRecommendations(result.vulnerabilities)
    };
  }
  
  private groupBySeverity(vulns: Vulnerability[]): Record<string, Vulnerability[]> {
    const grouped: Record<string, Vulnerability[]> = { critical: [], high: [], medium: [], low: [] };
    vulns.forEach(v => grouped[v.severity].push(v));
    return grouped;
  }
  
  private getRecommendations(vulns: Vulnerability[]): string[] {
    return [...new Set(vulns.map(v => v.remediation))];
  }
  
  toMarkdown(report: ScanReport): string {
    let md = '# Security Scan Report\n\n';
    md += '## Summary\n- Score: ' + report.summary.score + '/100\n';
    md += '- Vulnerabilities: ' + report.summary.totalVulnerabilities + '\n\n';
    md += '## Findings\n';
    Object.entries(report.bySeverity).forEach(([sev, vulns]) => {
      if (vulns.length) md += '### ' + sev.toUpperCase() + ' (' + vulns.length + ')\n';
    });
    return md;
  }
}

export interface ScanReport { summary: { scanId: string; target: string; score: number; totalVulnerabilities: number; duration: number }; bySeverity: Record<string, Vulnerability[]>; recommendations: string[]; }