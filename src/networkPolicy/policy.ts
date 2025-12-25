/**
 * @fileoverview Network Policy
 * @module @sentinela/core/networkPolicy
 */
export interface NetworkPolicy { name: string; ingress: string[]; egress: string[]; }
export class NetworkPolicyManager {
  private policies = new Map<string, NetworkPolicy>();
  create(policy: NetworkPolicy): void { this.policies.set(policy.name, policy); }
  get(name: string): NetworkPolicy | undefined { return this.policies.get(name); }
  delete(name: string): void { this.policies.delete(name); }
  isAllowed(policyName: string, source: string, dest: string): boolean {
    const p = this.policies.get(policyName);
    if (!p) return true;
    return p.egress.includes(dest) || p.egress.includes('*');
  }
}
