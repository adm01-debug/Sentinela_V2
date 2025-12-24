// Event Store - CQRS Advanced with Event Sourcing
export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly version: number;
  readonly payload: Record<string, unknown>;
  readonly metadata: EventMetadata;
  readonly timestamp: Date;
}

export interface EventMetadata {
  correlationId: string;
  causationId?: string;
  userId?: string;
}

export interface EventStream {
  aggregateId: string;
  aggregateType: string;
  events: DomainEvent[];
  version: number;
}

export interface EventStoreOptions {
  snapshotThreshold?: number;
}

export class EventStore {
  private streams: Map<string, DomainEvent[]> = new Map();
  private snapshots: Map<string, { state: unknown; version: number }> = new Map();
  private subscribers: Map<string, ((event: DomainEvent) => void)[]> = new Map();
  private options: EventStoreOptions;

  constructor(options: EventStoreOptions = {}) {
    this.options = { snapshotThreshold: 100, ...options };
  }

  async append(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    const stream = this.streams.get(aggregateId) || [];
    const currentVersion = stream.length;

    if (currentVersion !== expectedVersion) {
      throw new Error(`Concurrency conflict: expected ${expectedVersion}, got ${currentVersion}`);
    }

    const newEvents = events.map((e, i) => ({ ...e, version: currentVersion + i + 1 }));
    this.streams.set(aggregateId, [...stream, ...newEvents]);

    for (const event of newEvents) {
      this.publish(event);
    }
  }

  async getStream(aggregateId: string, fromVersion?: number): Promise<EventStream> {
    const events = this.streams.get(aggregateId) || [];
    const filtered = fromVersion ? events.filter(e => e.version > fromVersion) : events;

    return {
      aggregateId,
      aggregateType: events[0]?.aggregateType || "unknown",
      events: filtered,
      version: events.length
    };
  }

  async saveSnapshot(aggregateId: string, state: unknown, version: number): Promise<void> {
    this.snapshots.set(aggregateId, { state, version });
  }

  async getSnapshot(aggregateId: string): Promise<{ state: unknown; version: number } | null> {
    return this.snapshots.get(aggregateId) || null;
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => void): () => void {
    const handlers = this.subscribers.get(eventType) || [];
    handlers.push(handler);
    this.subscribers.set(eventType, handlers);
    return () => {
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    };
  }

  private publish(event: DomainEvent): void {
    const handlers = this.subscribers.get(event.eventType) || [];
    const allHandlers = this.subscribers.get("*") || [];
    [...handlers, ...allHandlers].forEach(h => h(event));
  }
}
