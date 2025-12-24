import { DLPPolicy, DataPattern } from './types';

export const BuiltInPatterns: Record<string, DataPattern> = {
  creditCard: { type: 'regex', value: '\\b(?:\\d[ -]*?){13,16}\\b' },
  ssn: { type: 'regex', value: '\\b\\d{3}-\\d{2}-\\d{4}\\b' },
  email: { type: 'regex', value: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b' },
  phone: { type: 'regex', value: '\\b\\+?\\d{1,3}[-.\\s]?\\(?\\d{2,3}\\)?[-.\\s]?\\d{3,4}[-.\\s]?\\d{4}\\b' },
  ipAddress: { type: 'regex', value: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' }
};

export class PolicyBuilder {
  private policy: Partial<DLPPolicy> = { patterns: [], actions: [] };
  
  withId(id: string): this { this.policy.id = id; return this; }
  withName(name: string): this { this.policy.name = name; return this; }
  withSeverity(severity: DLPPolicy['severity']): this { this.policy.severity = severity; return this; }
  addPattern(pattern: DataPattern): this { this.policy.patterns!.push(pattern); return this; }
  addAction(action: DLPPolicy['actions'][0]): this { this.policy.actions!.push(action); return this; }
  
  build(): DLPPolicy {
    if (!this.policy.id || !this.policy.name) throw new Error('ID and name required');
    return this.policy as DLPPolicy;
  }
}