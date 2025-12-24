export interface RetentionRule { dataType: string; retentionDays: number; archiveAfterDays?: number; deleteAfterArchive?: boolean; }
export class RetentionPolicy {
  private rules = new Map<string, RetentionRule>();
  addRule(rule: RetentionRule): void { this.rules.set(rule.dataType, rule); }
  getRule(dataType: string): RetentionRule | undefined { return this.rules.get(dataType); }
  getAllRules(): RetentionRule[] { return Array.from(this.rules.values()); }
  removeRule(dataType: string): boolean { return this.rules.delete(dataType); }
  shouldRetain(dataType: string, createdAt: Date): boolean { const rule = this.rules.get(dataType); if (!rule) return true; const age = (Date.now() - createdAt.getTime()) / 86400000; return age < rule.retentionDays; }
}
export const retentionPolicy = new RetentionPolicy();
