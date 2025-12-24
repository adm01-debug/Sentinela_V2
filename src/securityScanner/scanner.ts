import { ScanResult, Vulnerability } from './types';
import { v4 as uuidv4 } from 'uuid';

export class SecurityScanner {
  private checks: SecurityCheck[] = [];
  
  addCheck(check: SecurityCheck): void { this.checks.push(check); }
  
  async scan(target: string): Promise<ScanResult> {
    const scanId = uuidv4();
    const startedAt = new Date();
    const vulnerabilities: Vulnerability[] = [];
    
    for (const check of this.checks) {
      const results = await check.execute(target);
      vulnerabilities.push(...results);
    }
    
    return {
      scanId, target, startedAt, completedAt: new Date(),
      vulnerabilities,
      score: this.calculateScore(vulnerabilities)
    };
  }
  
  private calculateScore(vulns: Vulnerability[]): number {
    const weights = { critical: 40, high: 20, medium: 10, low: 5 };
    const penalty = vulns.reduce((sum, v) => sum + weights[v.severity], 0);
    return Math.max(0, 100 - penalty);
  }
}

export interface SecurityCheck { name: string; execute(target: string): Promise<Vulnerability[]>; }