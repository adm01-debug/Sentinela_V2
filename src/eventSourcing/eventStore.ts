import { StoredEvent, EventStream } from './types';
import { v4 as uuidv4 } from 'uuid';

export class EventStore {
  private streams: Map<string, StoredEvent[]> = new Map();
  private globalEvents: StoredEvent[] = [];
  private subscribers: ((event: StoredEvent) => void)[] = [];
  
  async append(streamId: string, events: Omit<StoredEvent, 'eventId' | 'version' | 'timestamp'>[], expectedVersion?: number): Promise<void> {
    const stream = this.streams.get(streamId) ?? [];
    if (expectedVersion !== undefined && stream.length !== expectedVersion) {
      throw new Error('Concurrency conflict: expected ' + expectedVersion + ', got ' + stream.length);
    }
    const newEvents = events.map((e, i) => ({
      ...e, eventId: uuidv4(), version: stream.length + i + 1, timestamp: new Date()
    }));
    this.streams.set(streamId, [...stream, ...newEvents]);
    this.globalEvents.push(...newEvents);
    newEvents.forEach(e => this.subscribers.forEach(s => s(e)));
  }
  
  async readStream(streamId: string, fromVersion?: number): Promise<EventStream> {
    const events = this.streams.get(streamId) ?? [];
    const filtered = fromVersion ? events.filter(e => e.version > fromVersion) : events;
    return { streamId, events: filtered, version: events.length };
  }
  
  async readAll(fromPosition?: number): Promise<StoredEvent[]> {
    return fromPosition ? this.globalEvents.slice(fromPosition) : this.globalEvents;
  }
  
  subscribe(handler: (event: StoredEvent) => void): () => void {
    this.subscribers.push(handler);
    return () => { this.subscribers = this.subscribers.filter(s => s !== handler); };
  }
}