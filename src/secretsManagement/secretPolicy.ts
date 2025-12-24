export interface SecretPolicy { id: string; name: string; rules: { pattern: string; minLength?: number; maxAge?: number; requireRotation?: boolean }[]; }
export class SecretPolicyManager {
  private policies = new Map<string, SecretPolicy>();
  addPolicy(policy: SecretPolicy): void { this.policies.set(policy.id, policy); }
  validate(key: string, value: string): { valid: boolean; violations: string[] } { const violations: string[] = []; this.policies.forEach(policy => { policy.rules.forEach(rule => { if (new RegExp(rule.pattern).test(key)) { if (rule.minLength && value.length < rule.minLength) { violations.push('Secret must be at least ' + rule.minLength + ' characters'); } } }); }); return { valid: violations.length === 0, violations }; }
  getPolicy(id: string): SecretPolicy | undefined { return this.policies.get(id); }
  list(): SecretPolicy[] { return Array.from(this.policies.values()); }
}
export const secretPolicyManager = new SecretPolicyManager();
