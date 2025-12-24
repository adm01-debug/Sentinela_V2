export type ConflictStrategy = 'source_wins' | 'target_wins' | 'latest_wins' | 'merge' | 'manual';
export interface Conflict { id: string; sourceData: any; targetData: any; sourceVersion: number; targetVersion: number; detectedAt: Date; resolved: boolean; resolution?: any; }
export class ConflictResolver {
  private strategy: ConflictStrategy = 'latest_wins';
  private conflicts: Conflict[] = [];
  setStrategy(strategy: ConflictStrategy): void { this.strategy = strategy; }
  detect(sourceData: any, targetData: any, sourceVersion: number, targetVersion: number): Conflict | null { if (JSON.stringify(sourceData) === JSON.stringify(targetData)) return null; const conflict: Conflict = { id: crypto.randomUUID(), sourceData, targetData, sourceVersion, targetVersion, detectedAt: new Date(), resolved: false }; this.conflicts.push(conflict); return conflict; }
  resolve(conflict: Conflict): any { switch (this.strategy) { case 'source_wins': return conflict.sourceData; case 'target_wins': return conflict.targetData; case 'latest_wins': return conflict.sourceVersion > conflict.targetVersion ? conflict.sourceData : conflict.targetData; default: return null; } }
  getUnresolved(): Conflict[] { return this.conflicts.filter(c => !c.resolved); }
}
export const conflictResolver = new ConflictResolver();
