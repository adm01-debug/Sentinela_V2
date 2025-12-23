export interface ConflictUIData { id: string; field: string; localValue: any; remoteValue: any; }
export class ConflictUI {
  private pendingConflicts: ConflictUIData[] = [];
  addConflict(conflict: ConflictUIData): void { this.pendingConflicts.push(conflict); }
  getConflicts(): ConflictUIData[] { return [...this.pendingConflicts]; }
  resolveConflict(id: string, choice: 'local' | 'remote'): any { const conflict = this.pendingConflicts.find(c => c.id === id); if (!conflict) return null; this.pendingConflicts = this.pendingConflicts.filter(c => c.id !== id); return choice === 'local' ? conflict.localValue : conflict.remoteValue; }
  clearAll(): void { this.pendingConflicts = []; }
  hasPending(): boolean { return this.pendingConflicts.length > 0; }
}
export const conflictUI = new ConflictUI();
