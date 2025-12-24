// Snapshot Store
export interface Snapshot<T> { aggregateId: string; version: number; state: T; timestamp: Date; }
export class SnapshotStore<T> {
  private snapshots: Map<string, Snapshot<T>> = new Map();
  async save(aggregateId: string, version: number, state: T): Promise<void> { this.snapshots.set(aggregateId, { aggregateId, version, state, timestamp: new Date() }); }
  async load(aggregateId: string): Promise<Snapshot<T> | null> { return this.snapshots.get(aggregateId) || null; }
  async delete(aggregateId: string): Promise<void> { this.snapshots.delete(aggregateId); }
}
