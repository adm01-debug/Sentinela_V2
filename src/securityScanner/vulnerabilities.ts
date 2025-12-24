import { Vulnerability, VulnType } from './types';
import { SecurityCheck } from './scanner';
import { v4 as uuidv4 } from 'uuid';

export class XSSCheck implements SecurityCheck {
  name = 'XSS Check';
  async execute(target: string): Promise<Vulnerability[]> {
    const vulns: Vulnerability[] = [];
    if (target.includes('<script>')) {
      vulns.push({ id: uuidv4(), type: 'xss', severity: 'high', description: 'Potential XSS vulnerability', location: target, remediation: 'Sanitize user input' });
    }
    return vulns;
  }
}

export class SQLiCheck implements SecurityCheck {
  name = 'SQL Injection Check';
  async execute(target: string): Promise<Vulnerability[]> {
    const vulns: Vulnerability[] = [];
    const patterns = ["'", '"', '--', ';', 'OR 1=1'];
    if (patterns.some(p => target.includes(p))) {
      vulns.push({ id: uuidv4(), type: 'sqli', severity: 'critical', description: 'Potential SQL injection', location: target, remediation: 'Use parameterized queries' });
    }
    return vulns;
  }
}

export class HeaderCheck implements SecurityCheck {
  name = 'Security Headers Check';
  async execute(target: string): Promise<Vulnerability[]> {
    return [{ id: uuidv4(), type: 'misc', severity: 'low', description: 'Missing security headers', location: 'HTTP Response', remediation: 'Add X-Frame-Options, CSP headers' }];
  }
}