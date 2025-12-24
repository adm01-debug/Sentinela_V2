import { policyEngine } from './policyEngine';
export type EnforcementAction = 'block' | 'warn' | 'log' | 'notify';
export interface EnforcementResult { enforced: boolean; action: EnforcementAction; reason?: string; }
export class PolicyEnforcer {
  private defaultAction: EnforcementAction = 'log';
  setDefaultAction(action: EnforcementAction): void { this.defaultAction = action; }
  enforce(context: Record<string, any>): EnforcementResult { const result = policyEngine.evaluate(context); if (!result.allowed) { return { enforced: true, action: 'block', reason: result.policy?.name }; } return { enforced: false, action: this.defaultAction }; }
  async enforceAsync(context: Record<string, any>, onViolation: (result: EnforcementResult) => Promise<void>): Promise<EnforcementResult> { const result = this.enforce(context); if (result.enforced) await onViolation(result); return result; }
}
export const policyEnforcer = new PolicyEnforcer();
