import { STRIDECategory } from './types';

export const MitigationStrategies: Record<STRIDECategory, string[]> = {
  spoofing: ['Strong authentication', 'MFA', 'Certificate validation'],
  tampering: ['Input validation', 'Integrity checks', 'Code signing'],
  repudiation: ['Audit logging', 'Digital signatures', 'Timestamps'],
  information_disclosure: ['Encryption', 'Access control', 'Data masking'],
  denial_of_service: ['Rate limiting', 'Load balancing', 'Resource quotas'],
  elevation_of_privilege: ['Least privilege', 'Role-based access', 'Input validation']
};

export class MitigationAdvisor {
  suggest(category: STRIDECategory): string[] { return MitigationStrategies[category] ?? []; }
  suggestAll(categories: STRIDECategory[]): Map<STRIDECategory, string[]> {
    const suggestions = new Map<STRIDECategory, string[]>();
    categories.forEach(c => suggestions.set(c, this.suggest(c)));
    return suggestions;
  }
}