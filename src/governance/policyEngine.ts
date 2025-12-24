export interface Policy { id: string; name: string; description: string; rules: PolicyRule[]; enabled: boolean; priority: number; }
export interface PolicyRule { condition: string; action: 'allow' | 'deny' | 'audit'; }
export class PolicyEngine {
  private policies = new Map<string, Policy>();
  register(policy: Policy): void { this.policies.set(policy.id, policy); }
  evaluate(context: Record<string, any>): { allowed: boolean; policy?: Policy; rule?: PolicyRule } { const sorted = Array.from(this.policies.values()).filter(p => p.enabled).sort((a, b) => b.priority - a.priority); for (const policy of sorted) { for (const rule of policy.rules) { if (this.matchCondition(rule.condition, context)) { return { allowed: rule.action === 'allow', policy, rule }; } } } return { allowed: true }; }
  private matchCondition(condition: string, context: Record<string, any>): boolean { try { return new Function('ctx', 'return ' + condition)(context); } catch { return false; } }
  list(): Policy[] { return Array.from(this.policies.values()); }
}
export const policyEngine = new PolicyEngine();
