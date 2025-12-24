export interface EscalationLevel { level: number; contacts: { name: string; channel: string; address: string }[]; timeoutMinutes: number; }
export interface EscalationPolicy { id: string; name: string; levels: EscalationLevel[]; }
export class EscalationManager {
  private policies = new Map<string, EscalationPolicy>();
  private escalations = new Map<string, { policyId: string; currentLevel: number; escalatedAt: Date }>();
  addPolicy(policy: EscalationPolicy): void { this.policies.set(policy.id, policy); }
  escalate(incidentId: string, policyId: string): EscalationLevel | null { const policy = this.policies.get(policyId); if (!policy) return null; const current = this.escalations.get(incidentId); const level = current ? current.currentLevel + 1 : 0; if (level >= policy.levels.length) return null; this.escalations.set(incidentId, { policyId, currentLevel: level, escalatedAt: new Date() }); return policy.levels[level]; }
  getCurrentLevel(incidentId: string): number { return this.escalations.get(incidentId)?.currentLevel || 0; }
}
export const escalationManager = new EscalationManager();
