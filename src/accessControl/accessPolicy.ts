export interface AccessPolicy { id: string; name: string; description: string; subjects: string[]; resources: string[]; actions: string[]; conditions?: Record<string, any>; effect: 'allow' | 'deny'; }
export class AccessPolicyManager {
  private policies = new Map<string, AccessPolicy>();
  create(policy: AccessPolicy): void { this.policies.set(policy.id, policy); }
  get(id: string): AccessPolicy | undefined { return this.policies.get(id); }
  evaluate(subject: string, resource: string, action: string): { allowed: boolean; policy?: AccessPolicy } { for (const policy of this.policies.values()) { if (policy.subjects.includes(subject) || policy.subjects.includes('*')) { if (policy.resources.includes(resource) || policy.resources.includes('*')) { if (policy.actions.includes(action) || policy.actions.includes('*')) { return { allowed: policy.effect === 'allow', policy }; } } } } return { allowed: false }; }
  list(): AccessPolicy[] { return Array.from(this.policies.values()); }
  delete(id: string): boolean { return this.policies.delete(id); }
}
export const accessPolicyManager = new AccessPolicyManager();
