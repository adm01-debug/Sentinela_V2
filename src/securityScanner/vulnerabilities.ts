import { Vulnerability } from './types';
import { v4 as uuidv4 } from 'uuid';

export const VulnerabilityDatabase: Record<string, Omit<Vulnerability, 'id'>> = {
  SQL_INJECTION: { type: 'injection', severity: 'critical', description: 'SQL Injection vulnerability detected', remediation: 'Use parameterized queries' },
  XSS: { type: 'xss', severity: 'high', description: 'Cross-Site Scripting vulnerability', remediation: 'Sanitize user input' },
  CSRF: { type: 'csrf', severity: 'medium', description: 'CSRF protection missing', remediation: 'Implement CSRF tokens' },
  WEAK_PASSWORD: { type: 'auth', severity: 'medium', description: 'Weak password policy', remediation: 'Enforce strong passwords' }
};

export function createVulnerability(type: keyof typeof VulnerabilityDatabase, location?: string): Vulnerability {
  const base = VulnerabilityDatabase[type];
  return { id: uuidv4(), ...base, location };
}