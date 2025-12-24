export interface Attribute { key: string; value: any; }
export interface ABACPolicy { id: string; name: string; rules: ABACRule[]; }
export interface ABACRule { subject: Record<string, any>; resource: Record<string, any>; action: string; effect: 'allow' | 'deny'; }
export class ABAC {
  private policies: ABACPolicy[] = [];
  addPolicy(policy: ABACPolicy): void { this.policies.push(policy); }
  evaluate(subject: Record<string, any>, resource: Record<string, any>, action: string): boolean { for (const policy of this.policies) { for (const rule of policy.rules) { if (this.matchRule(rule, subject, resource, action)) { return rule.effect === 'allow'; } } } return false; }
  private matchRule(rule: ABACRule, subject: Record<string, any>, resource: Record<string, any>, action: string): boolean { if (rule.action !== action && rule.action !== '*') return false; for (const [key, value] of Object.entries(rule.subject)) { if (subject[key] !== value && value !== '*') return false; } for (const [key, value] of Object.entries(rule.resource)) { if (resource[key] !== value && value !== '*') return false; } return true; }
}
export const abac = new ABAC();
