export interface SecretAccess { id: string; key: string; action: 'read' | 'write' | 'delete'; userId: string; timestamp: Date; success: boolean; }
export class SecretAudit {
  private accesses: SecretAccess[] = [];
  log(key: string, action: SecretAccess['action'], userId: string, success: boolean): void { this.accesses.push({ id: crypto.randomUUID(), key, action, userId, timestamp: new Date(), success }); }
  getByKey(key: string): SecretAccess[] { return this.accesses.filter(a => a.key === key); }
  getByUser(userId: string): SecretAccess[] { return this.accesses.filter(a => a.userId === userId); }
  getRecent(hours = 24): SecretAccess[] { const cutoff = new Date(Date.now() - hours * 3600000); return this.accesses.filter(a => a.timestamp >= cutoff); }
  getFailures(): SecretAccess[] { return this.accesses.filter(a => !a.success); }
}
export const secretAudit = new SecretAudit();
