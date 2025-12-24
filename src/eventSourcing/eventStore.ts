import { StoredEvent, EventStream, EventMetadata } from './types';
import { v4 as uuidv4 } from 'uuid';

export class EventStore {
  private streams: Map<string, StoredEvent[]> = new Map();
  private allEvents: StoredEvent[] = [];
  private subscribers: Array<(event: StoredEvent) => void> = [];
  
  async append(streamId: string, eventType: string, data: unknown, metadata?: Partial<EventMetadata>, expectedVersion?: number): Promise<StoredEvent> {
    const stream = this.streams.get(streamId) ?? [];
    if (expectedVersion !== undefined && stream.length !== expectedVersion) {
      throw new ConcurrencyError(streamId, expectedVersion, stream.length);
    }
    const event: StoredEvent = {
      eventId: uuidv4(),
      streamId,
      eventType,
      data,
      metadata: { correlationId: metadata?.correlationId ?? uuidv4(), causationId: metadata?.causationId, userId: metadata?.userId, timestamp: new Date() },
      version: stream.length + 1,
      timestamp: new Date()
    };
    stream.push(event);
    this.streams.set(streamId, stream);
    this.allEvents.push(event);
    this.subscribers.forEach(s => s(event));
    return event;
  }
  
  async getStream(streamId: string, fromVersion?: number, toVersion?: number): Promise<EventStream> {
    let events = this.streams.get(streamId) ?? [];
    if (fromVersion) events = events.filter(e => e.version >= fromVersion);
    if (toVersion) events = events.filter(e => e.version <= toVersion);
    return { streamId, events, version: events.length > 0 ? events[events.length - 1].version : 0 };
  }
  
  async getAllEvents(fromPosition?: number): Promise<StoredEvent[]> {
    return fromPosition ? this.allEvents.slice(fromPosition) : [...this.allEvents];
  }
  
  subscribe(handler: (event: StoredEvent) => void): () => void {
    this.subscribers.push(handler);
    return () => { const idx = this.subscribers.indexOf(handler); if (idx > -1) this.subscribers.splice(idx, 1); };
  }
}

export class ConcurrencyError extends Error {
  constructor(streamId: string, expected: number, actual: number) {
    super('Concurrency error for ' + streamId + ': expected ' + expected + ', got ' + actual);
  }
}