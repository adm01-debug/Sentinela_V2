/**
 * @fileoverview Vulnerability scanner
 * @module @sentinela/core/securityScanner
 * @version 13.0.0
 */

import { ScanResult, Vulnerability, ScanConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

export class SecurityScanner {
  private rules: ScanRule[] = [];
  
  addRule(rule: ScanRule): void { this.rules.push(rule); }
  
  async scan(target: string, config: ScanConfig): Promise<ScanResult> {
    const vulnerabilities: Vulnerability[] = [];
    for (const rule of this.rules) {
      const findings = await rule.check(target);
      vulnerabilities.push(...findings);
    }
    return { target, vulnerabilities, score: this.calculateScore(vulnerabilities), scannedAt: new Date() };
  }
  
  private calculateScore(vulns: Vulnerability[]): number {
    const weights = { critical: 40, high: 20, medium: 10, low: 5 };
    const penalty = vulns.reduce((sum, v) => sum + weights[v.severity], 0);
    return Math.max(0, 100 - penalty);
  }
}

export interface ScanRule { name: string; check: (target: string) => Promise<Vulnerability[]>; }