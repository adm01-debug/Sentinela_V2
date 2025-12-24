// Traffic Policy Management
export type TrafficSplit = { version: string; weight: number }[];

export interface TrafficPolicy {
  service: string;
  loadBalancer: "round-robin" | "random" | "least-conn";
  connectionPool: { maxConnections: number; maxPending: number };
  outlierDetection: { consecutiveErrors: number; interval: number; baseEjectionTime: number };
  retryPolicy: { attempts: number; perTryTimeout: number; retryOn: string[] };
  trafficSplit?: TrafficSplit;
}

export class TrafficPolicyManager {
  private policies: Map<string, TrafficPolicy> = new Map();

  setPolicy(policy: TrafficPolicy): void {
    this.policies.set(policy.service, policy);
  }

  getPolicy(service: string): TrafficPolicy | undefined {
    return this.policies.get(service);
  }

  removePolicy(service: string): void {
    this.policies.delete(service);
  }

  selectVersion(service: string): string | null {
    const policy = this.policies.get(service);
    if (!policy?.trafficSplit) return null;
    
    const total = policy.trafficSplit.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * total;
    for (const split of policy.trafficSplit) {
      random -= split.weight;
      if (random <= 0) return split.version;
    }
    return policy.trafficSplit[0]?.version || null;
  }

  getAllPolicies(): TrafficPolicy[] {
    return Array.from(this.policies.values());
  }
}
