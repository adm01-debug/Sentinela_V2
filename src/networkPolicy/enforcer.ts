import { NetworkPolicy } from './types';

export class PolicyEnforcer {
  private policies: Map<string, NetworkPolicy[]> = new Map();
  
  apply(policy: NetworkPolicy): void {
    const key = policy.namespace;
    const policies = this.policies.get(key) ?? [];
    const existing = policies.findIndex(p => p.name === policy.name);
    if (existing >= 0) policies[existing] = policy;
    else policies.push(policy);
    this.policies.set(key, policies);
  }
  
  delete(namespace: string, name: string): boolean {
    const policies = this.policies.get(namespace);
    if (!policies) return false;
    const index = policies.findIndex(p => p.name === name);
    if (index >= 0) { policies.splice(index, 1); return true; }
    return false;
  }
  
  evaluate(namespace: string, srcLabels: Record<string, string>, dstLabels: Record<string, string>, port: number): EvaluationResult {
    const policies = this.policies.get(namespace) ?? [];
    
    for (const policy of policies) {
      if (this.matchesSelector(dstLabels, policy.podSelector)) {
        const allowed = policy.ingress.some(rule => rule.ports.some(p => p.port === port));
        if (!allowed) return { allowed: false, policy: policy.name };
      }
    }
    
    return { allowed: true };
  }
  
  private matchesSelector(labels: Record<string, string>, selector: NetworkPolicy['podSelector']): boolean {
    return Object.entries(selector.matchLabels).every(([k, v]) => labels[k] === v);
  }
}

export interface EvaluationResult { allowed: boolean; policy?: string; }