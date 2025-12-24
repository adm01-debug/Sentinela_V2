import { StoredEvent } from './types';

export interface Snapshot<S> { streamId: string; version: number; state: S; timestamp: Date; }

export class SnapshotStore<S> {
  private snapshots: Map<string, Snapshot<S>> = new Map();
  
  async save(snapshot: Snapshot<S>): Promise<void> { this.snapshots.set(snapshot.streamId, snapshot); }
  async load(streamId: string): Promise<Snapshot<S> | null> { return this.snapshots.get(streamId) ?? null; }
  async delete(streamId: string): Promise<void> { this.snapshots.delete(streamId); }
}

export class SnapshotStrategy {
  constructor(private eventsThreshold: number = 100) {}
  
  shouldSnapshot(eventsSinceLastSnapshot: number): boolean {
    return eventsSinceLastSnapshot >= this.eventsThreshold;
  }
}

export class AggregateSnapshotter<S> {
  constructor(
    private store: SnapshotStore<S>,
    private strategy: SnapshotStrategy,
    private rebuildState: (events: StoredEvent[]) => S
  ) {}
  
  async loadOrRebuild(streamId: string, events: StoredEvent[]): Promise<{ state: S; fromVersion: number }> {
    const snapshot = await this.store.load(streamId);
    if (snapshot) {
      const newEvents = events.filter(e => e.version > snapshot.version);
      const state = newEvents.reduce((s, e) => this.applyEvent(s, e), snapshot.state);
      return { state, fromVersion: snapshot.version };
    }
    return { state: this.rebuildState(events), fromVersion: 0 };
  }
  
  private applyEvent(state: S, event: StoredEvent): S { return state; }
}