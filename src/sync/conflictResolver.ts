export interface ConflictItem { id: string; localData: any; remoteData: any; localTimestamp: number; remoteTimestamp: number; }
export type Resolution = 'local' | 'remote' | 'merge';
export class ConflictResolver {
  resolve(conflict: ConflictItem, strategy: Resolution = 'remote'): any { switch (strategy) { case 'local': return conflict.localData; case 'remote': return conflict.remoteData; case 'merge': return this.merge(conflict); } }
  private merge(conflict: ConflictItem): any { return { ...conflict.remoteData, ...conflict.localData, _mergedAt: Date.now() }; }
  autoResolve(conflict: ConflictItem): any { return conflict.localTimestamp > conflict.remoteTimestamp ? conflict.localData : conflict.remoteData; }
}
export const conflictResolver = new ConflictResolver();
