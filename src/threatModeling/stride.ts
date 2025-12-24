import { STRIDECategory, Threat } from './types';

export class STRIDEAnalyzer {
  private templates: Map<STRIDECategory, ThreatTemplate[]> = new Map();
  
  constructor() { this.initializeTemplates(); }
  
  private initializeTemplates(): void {
    this.templates.set('spoofing', [
      { description: 'Attacker impersonates legitimate user', defaultMitigations: ['Multi-factor authentication', 'Strong password policy'] }
    ]);
    this.templates.set('tampering', [
      { description: 'Data modified in transit', defaultMitigations: ['Use TLS/HTTPS', 'Digital signatures'] }
    ]);
    this.templates.set('repudiation', [
      { description: 'User denies performing action', defaultMitigations: ['Audit logging', 'Digital signatures'] }
    ]);
    this.templates.set('information_disclosure', [
      { description: 'Sensitive data exposed', defaultMitigations: ['Encryption at rest', 'Access controls'] }
    ]);
    this.templates.set('denial_of_service', [
      { description: 'Service unavailable', defaultMitigations: ['Rate limiting', 'Load balancing'] }
    ]);
    this.templates.set('elevation_of_privilege', [
      { description: 'Unauthorized access to resources', defaultMitigations: ['Principle of least privilege', 'Input validation'] }
    ]);
  }
  
  analyzeAsset(assetId: string, assetType: string): Partial<Threat>[] {
    const threats: Partial<Threat>[] = [];
    for (const [category, templates] of this.templates) {
      templates.forEach(t => {
        threats.push({ category, description: t.description, targetAsset: assetId, mitigations: t.defaultMitigations });
      });
    }
    return threats;
  }
  
  getTemplates(category: STRIDECategory): ThreatTemplate[] { return this.templates.get(category) ?? []; }
}

export interface ThreatTemplate { description: string; defaultMitigations: string[]; }