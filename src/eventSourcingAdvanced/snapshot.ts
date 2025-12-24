export interface Snapshot<S> {
  streamId: string;
  version: number;
  state: S;
  timestamp: Date;
}

export class SnapshotStore<S> {
  private snapshots: Map<string, Snapshot<S>> = new Map();
  
  async save(snapshot: Snapshot<S>): Promise<void> {
    this.snapshots.set(snapshot.streamId, snapshot);
  }
  
  async get(streamId: string): Promise<Snapshot<S> | null> {
    return this.snapshots.get(streamId) ?? null;
  }
  
  async delete(streamId: string): Promise<void> {
    this.snapshots.delete(streamId);
  }
}

export class SnapshotStrategy {
  constructor(private everyNEvents: number = 100) {}
  
  shouldSnapshot(eventsSinceLastSnapshot: number): boolean {
    return eventsSinceLastSnapshot >= this.everyNEvents;
  }
}