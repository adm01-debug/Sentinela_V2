// Event Store Implementation
import { DomainEvent, EventMetadata, EventHandler } from './types';
import { v4 as uuidv4 } from 'uuid';

export interface EventStore {
  append(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
  getAllEvents(fromPosition?: number): Promise<DomainEvent[]>;
  subscribe(handler: EventHandler): void;
}

export class InMemoryEventStore implements EventStore {
  private streams: Map<string, DomainEvent[]> = new Map();
  private allEvents: DomainEvent[] = [];
  private handlers: EventHandler[] = [];

  async append(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    const stream = this.streams.get(aggregateId) ?? [];
    const currentVersion = stream.length;

    if (currentVersion !== expectedVersion) {
      throw new ConcurrencyError(aggregateId, expectedVersion, currentVersion);
    }

    const newEvents = events.map((event, index) => ({
      ...event,
      version: currentVersion + index + 1
    }));

    this.streams.set(aggregateId, [...stream, ...newEvents]);
    this.allEvents.push(...newEvents);

    // Dispatch events to handlers
    for (const event of newEvents) {
      await this.dispatchEvent(event);
    }
  }

  async getEvents(aggregateId: string, fromVersion: number = 0): Promise<DomainEvent[]> {
    const stream = this.streams.get(aggregateId) ?? [];
    return stream.filter(e => e.version > fromVersion);
  }

  async getAllEvents(fromPosition: number = 0): Promise<DomainEvent[]> {
    return this.allEvents.slice(fromPosition);
  }

  subscribe(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  private async dispatchEvent(event: DomainEvent): Promise<void> {
    for (const handler of this.handlers) {
      if (handler.eventType === event.eventType || handler.eventType === '*') {
        try {
          await handler.handle(event);
        } catch (error) {
          console.error(\`Error handling event \${event.eventType}:\`, error);
        }
      }
    }
  }
}

export class ConcurrencyError extends Error {
  constructor(
    public readonly aggregateId: string,
    public readonly expectedVersion: number,
    public readonly actualVersion: number
  ) {
    super(\`Concurrency conflict for aggregate \${aggregateId}: expected version \${expectedVersion}, got \${actualVersion}\`);
    this.name = 'ConcurrencyError';
  }
}

export class EventBuilder {
  static create<T>(
    eventType: string,
    aggregateId: string,
    aggregateType: string,
    payload: T,
    metadata: Partial<EventMetadata> = {}
  ): DomainEvent<T> {
    return {
      eventId: uuidv4(),
      eventType,
      aggregateId,
      aggregateType,
      payload,
      metadata: {
        correlationId: metadata.correlationId ?? uuidv4(),
        causationId: metadata.causationId ?? uuidv4(),
        timestamp: metadata.timestamp ?? new Date(),
        userId: metadata.userId,
        tenantId: metadata.tenantId
      },
      version: 0
    };
  }
}

export class Snapshot<S> {
  constructor(
    public readonly aggregateId: string,
    public readonly version: number,
    public readonly state: S,
    public readonly timestamp: Date
  ) {}
}

export interface SnapshotStore<S> {
  save(snapshot: Snapshot<S>): Promise<void>;
  get(aggregateId: string): Promise<Snapshot<S> | null>;
}

export class InMemorySnapshotStore<S> implements SnapshotStore<S> {
  private snapshots: Map<string, Snapshot<S>> = new Map();

  async save(snapshot: Snapshot<S>): Promise<void> {
    this.snapshots.set(snapshot.aggregateId, snapshot);
  }

  async get(aggregateId: string): Promise<Snapshot<S> | null> {
    return this.snapshots.get(aggregateId) ?? null;
  }
}
