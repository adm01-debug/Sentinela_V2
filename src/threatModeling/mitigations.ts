import { Threat, STRIDECategory } from './types';

export class MitigationLibrary {
  private mitigations: Map<STRIDECategory, Mitigation[]> = new Map([
    ['spoofing', [{ id: 'm1', name: 'MFA', description: 'Implement multi-factor authentication', cost: 'medium', effectiveness: 'high' }]],
    ['tampering', [{ id: 'm2', name: 'TLS', description: 'Use TLS for all communications', cost: 'low', effectiveness: 'high' }]],
    ['repudiation', [{ id: 'm3', name: 'Audit Logs', description: 'Comprehensive audit logging', cost: 'low', effectiveness: 'medium' }]],
    ['information_disclosure', [{ id: 'm4', name: 'Encryption', description: 'Encrypt sensitive data', cost: 'medium', effectiveness: 'high' }]],
    ['denial_of_service', [{ id: 'm5', name: 'Rate Limiting', description: 'Implement rate limiting', cost: 'low', effectiveness: 'medium' }]],
    ['elevation_of_privilege', [{ id: 'm6', name: 'RBAC', description: 'Role-based access control', cost: 'medium', effectiveness: 'high' }]]
  ]);
  
  getForCategory(category: STRIDECategory): Mitigation[] { return this.mitigations.get(category) ?? []; }
  
  recommendForThreat(threat: Threat): Mitigation[] {
    return this.getForCategory(threat.category).filter(m => m.effectiveness === 'high' || threat.impact >= 4);
  }
  
  calculateResidualRisk(threat: Threat, appliedMitigations: string[]): number {
    const mitigations = this.getForCategory(threat.category);
    const applied = mitigations.filter(m => appliedMitigations.includes(m.id));
    const reduction = applied.reduce((sum, m) => sum + (m.effectiveness === 'high' ? 0.4 : m.effectiveness === 'medium' ? 0.25 : 0.1), 0);
    return Math.max(0, (threat.likelihood * threat.impact) * (1 - Math.min(reduction, 0.9)));
  }
}

export interface Mitigation { id: string; name: string; description: string; cost: 'low' | 'medium' | 'high'; effectiveness: 'low' | 'medium' | 'high'; }