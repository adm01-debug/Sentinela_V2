import { Event, RecordedEvent, StreamMetadata } from './types';
import { v4 as uuidv4 } from 'uuid';

export class EventStoreDB {
  private streams: Map<string, RecordedEvent[]> = new Map();
  private metadata: Map<string, StreamMetadata> = new Map();
  private globalPosition: number = 0;
  
  async appendToStream(streamId: string, events: Event[], expectedVersion?: number): Promise<WriteResult> {
    const stream = this.streams.get(streamId) ?? [];
    if (expectedVersion !== undefined && stream.length !== expectedVersion) {
      throw new Error('Wrong expected version');
    }
    
    const recorded = events.map((e, i) => ({
      ...e, eventId: e.eventId ?? uuidv4(), streamId, streamPosition: stream.length + i, globalPosition: ++this.globalPosition, created: new Date()
    }));
    
    this.streams.set(streamId, [...stream, ...recorded]);
    return { nextExpectedVersion: stream.length + events.length, position: { commit: this.globalPosition } };
  }
  
  async readStream(streamId: string, direction: 'forwards' | 'backwards' = 'forwards', fromRevision?: number, count?: number): Promise<RecordedEvent[]> {
    const stream = this.streams.get(streamId) ?? [];
    let events = direction === 'backwards' ? [...stream].reverse() : stream;
    if (fromRevision !== undefined) events = events.filter(e => direction === 'forwards' ? e.streamPosition >= fromRevision : e.streamPosition <= fromRevision);
    if (count !== undefined) events = events.slice(0, count);
    return events;
  }
  
  async readAll(fromPosition?: number, count?: number): Promise<RecordedEvent[]> {
    const all = Array.from(this.streams.values()).flat().sort((a, b) => a.globalPosition - b.globalPosition);
    let events = fromPosition ? all.filter(e => e.globalPosition >= fromPosition) : all;
    if (count !== undefined) events = events.slice(0, count);
    return events;
  }
  
  async setStreamMetadata(streamId: string, metadata: StreamMetadata): Promise<void> {
    this.metadata.set(streamId, metadata);
  }
}

export interface WriteResult { nextExpectedVersion: number; position: { commit: number }; }