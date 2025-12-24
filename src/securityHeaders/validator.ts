import { SecurityHeaders } from './types';

export class HeaderValidator {
  validate(headers: SecurityHeaders): ValidationResult {
    const issues: string[] = [];
    const score = this.calculateScore(headers, issues);
    return { valid: issues.length === 0, score, issues };
  }
  
  private calculateScore(headers: SecurityHeaders, issues: string[]): number {
    let score = 0;
    if (headers['Content-Security-Policy']) score += 25; else issues.push('Missing CSP');
    if (headers['Strict-Transport-Security']) score += 25; else issues.push('Missing HSTS');
    if (headers['X-Frame-Options']) score += 15; else issues.push('Missing X-Frame-Options');
    if (headers['X-Content-Type-Options']) score += 15; else issues.push('Missing X-Content-Type-Options');
    if (headers['X-XSS-Protection']) score += 10;
    if (headers['Referrer-Policy']) score += 10;
    return score;
  }
}

export interface ValidationResult { valid: boolean; score: number; issues: string[]; }