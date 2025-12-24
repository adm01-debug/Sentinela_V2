import { ReplicatedData } from './replicator';
export type SyncStatus = 'synced' | 'pending' | 'failed' | 'conflict';
export interface SyncState { sourceId: string; targetId: string; status: SyncStatus; lastSync: Date; pendingChanges: number; }
export class SyncManager {
  private states = new Map<string, SyncState>();
  updateState(sourceId: string, targetId: string, status: SyncStatus): void { const key = sourceId + ':' + targetId; this.states.set(key, { sourceId, targetId, status, lastSync: new Date(), pendingChanges: 0 }); }
  getState(sourceId: string, targetId: string): SyncState | undefined { return this.states.get(sourceId + ':' + targetId); }
  getPending(): SyncState[] { return Array.from(this.states.values()).filter(s => s.status === 'pending'); }
  getConflicts(): SyncState[] { return Array.from(this.states.values()).filter(s => s.status === 'conflict'); }
}
export const syncManager = new SyncManager();
