export interface AccessContext { user: { id: string; role: string; department: string }; device: { id: string; type: string; managed: boolean }; network: { ip: string; location: string; vpn: boolean }; resource: { id: string; sensitivity: string }; }
export class ContextualAccess {
  private policies: ((ctx: AccessContext) => boolean)[] = [];
  addPolicy(policy: (ctx: AccessContext) => boolean): void { this.policies.push(policy); }
  evaluate(context: AccessContext): { allowed: boolean; reason: string } { for (const policy of this.policies) { if (!policy(context)) return { allowed: false, reason: 'Policy violation' }; } return { allowed: true, reason: 'All policies passed' }; }
  requireManagedDevice(): void { this.addPolicy(ctx => ctx.device.managed); }
  requireVPN(): void { this.addPolicy(ctx => ctx.network.vpn); }
  requireDepartment(department: string): void { this.addPolicy(ctx => ctx.user.department === department); }
}
export const contextualAccess = new ContextualAccess();
