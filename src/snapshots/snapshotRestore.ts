import { snapshotManager, Snapshot } from './snapshotManager';
export class SnapshotRestore {
  restore<T>(snapshotId: string): T | null { const snapshot = snapshotManager.get(snapshotId); return snapshot?.data || null; }
  restoreToPoint<T>(name: string, timestamp: Date): T | null { const snapshots = snapshotManager.getByName(name).filter(s => s.timestamp <= timestamp).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); return snapshots[0]?.data || null; }
  getRestorePoints(name: string): Snapshot[] { return snapshotManager.getByName(name).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); }
}
export const snapshotRestore = new SnapshotRestore();
