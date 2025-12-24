import { SecurityHeadersConfig } from './types';

export class HeaderValidator {
  validate(headers: Record<string, string>): ValidationResult {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];
    
    if (!headers['Content-Security-Policy']) {
      issues.push({ header: 'Content-Security-Policy', severity: 'high', message: 'CSP header is missing' });
      recommendations.push('Implement Content Security Policy');
    }
    
    if (!headers['Strict-Transport-Security']) {
      issues.push({ header: 'Strict-Transport-Security', severity: 'high', message: 'HSTS header is missing' });
      recommendations.push('Enable HSTS with a long max-age');
    }
    
    if (!headers['X-Frame-Options']) {
      issues.push({ header: 'X-Frame-Options', severity: 'medium', message: 'X-Frame-Options is missing' });
    }
    
    if (!headers['X-Content-Type-Options']) {
      issues.push({ header: 'X-Content-Type-Options', severity: 'low', message: 'X-Content-Type-Options is missing' });
    }
    
    const score = Math.max(0, 100 - issues.reduce((sum, i) => sum + (i.severity === 'high' ? 25 : i.severity === 'medium' ? 15 : 5), 0));
    return { score, issues, recommendations, passed: score >= 70 };
  }
}

export interface ValidationResult { score: number; issues: ValidationIssue[]; recommendations: string[]; passed: boolean; }
export interface ValidationIssue { header: string; severity: 'low' | 'medium' | 'high'; message: string; }