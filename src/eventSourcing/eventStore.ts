/**
 * @fileoverview Event Store implementation
 * @module @sentinela/core/eventSourcing
 * @version 13.0.0
 */

export interface StoredEvent {
  id: string;
  aggregateId: string;
  type: string;
  data: unknown;
  version: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface EventStore {
  append(aggregateId: string, events: Omit<StoredEvent, 'id' | 'timestamp'>[]): Promise<void>;
  load(aggregateId: string, fromVersion?: number): Promise<StoredEvent[]>;
  loadAll(fromPosition?: number): Promise<StoredEvent[]>;
}

export class InMemoryEventStore implements EventStore {
  private events: StoredEvent[] = [];
  private idCounter = 0;

  async append(aggregateId: string, events: Omit<StoredEvent, 'id' | 'timestamp'>[]): Promise<void> {
    for (const event of events) {
      this.events.push({
        ...event,
        id: String(++this.idCounter),
        aggregateId,
        timestamp: new Date()
      });
    }
  }

  async load(aggregateId: string, fromVersion = 0): Promise<StoredEvent[]> {
    return this.events
      .filter(e => e.aggregateId === aggregateId && e.version >= fromVersion)
      .sort((a, b) => a.version - b.version);
  }

  async loadAll(fromPosition = 0): Promise<StoredEvent[]> {
    return this.events.slice(fromPosition);
  }

  clear(): void {
    this.events = [];
    this.idCounter = 0;
  }
}

export class SnapshotStore {
  private snapshots = new Map<string, { state: unknown; version: number }>();

  async save(aggregateId: string, snapshot: { state: unknown; version: number }): Promise<void> {
    this.snapshots.set(aggregateId, snapshot);
  }

  async load(aggregateId: string): Promise<{ state: unknown; version: number } | null> {
    return this.snapshots.get(aggregateId) || null;
  }

  clear(): void {
    this.snapshots.clear();
  }
}
