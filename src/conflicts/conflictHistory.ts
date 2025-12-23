export interface ConflictRecord { id: string; entityType: string; entityId: string; localData: any; remoteData: any; resolution: 'local' | 'remote' | 'merge'; resolvedAt: Date; resolvedBy?: string; }
export class ConflictHistory {
  private history: ConflictRecord[] = [];
  record(conflict: Omit<ConflictRecord, 'id' | 'resolvedAt'>): string { const id = crypto.randomUUID(); this.history.push({ ...conflict, id, resolvedAt: new Date() }); return id; }
  getByEntity(entityType: string): ConflictRecord[] { return this.history.filter(c => c.entityType === entityType); }
  getRecent(count = 10): ConflictRecord[] { return this.history.slice(-count); }
  clear(): void { this.history = []; }
}
export const conflictHistory = new ConflictHistory();
