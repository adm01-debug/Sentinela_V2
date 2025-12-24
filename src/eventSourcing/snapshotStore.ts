import { Snapshot } from './types';

export class SnapshotStore<T> {
  private snapshots: Map<string, Snapshot<T>> = new Map();
  
  async save(streamId: string, state: T, version: number): Promise<Snapshot<T>> {
    const snapshot: Snapshot<T> = { streamId, state, version, timestamp: new Date() };
    this.snapshots.set(streamId, snapshot);
    return snapshot;
  }
  
  async get(streamId: string): Promise<Snapshot<T> | null> { return this.snapshots.get(streamId) ?? null; }
  async delete(streamId: string): Promise<void> { this.snapshots.delete(streamId); }
}

export class SnapshotStrategy {
  constructor(private eventThreshold: number = 100) {}
  
  shouldSnapshot(currentVersion: number, lastSnapshotVersion: number): boolean {
    return currentVersion - lastSnapshotVersion >= this.eventThreshold;
  }
}