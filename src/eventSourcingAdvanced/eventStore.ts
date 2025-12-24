import { StoredEvent, StreamInfo, EventMetadata } from './types';
import { v4 as uuidv4 } from 'uuid';

export class EventStoreDB {
  private streams: Map<string, StoredEvent[]> = new Map();
  
  async appendToStream(streamId: string, events: Omit<StoredEvent, 'eventId' | 'version' | 'timestamp'>[], expectedVersion?: number): Promise<AppendResult> {
    const stream = this.streams.get(streamId) ?? [];
    const currentVersion = stream.length;
    
    if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
      throw new ConcurrencyError(streamId, expectedVersion, currentVersion);
    }
    
    const newEvents = events.map((e, i) => ({
      ...e,
      eventId: uuidv4(),
      version: currentVersion + i + 1,
      timestamp: new Date()
    }));
    
    this.streams.set(streamId, [...stream, ...newEvents]);
    return { streamId, nextExpectedVersion: currentVersion + events.length, position: newEvents.length };
  }
  
  async readStream(streamId: string, fromVersion?: number, count?: number): Promise<StoredEvent[]> {
    const stream = this.streams.get(streamId) ?? [];
    let result = stream;
    if (fromVersion) result = result.filter(e => e.version >= fromVersion);
    if (count) result = result.slice(0, count);
    return result;
  }
  
  async readAll(fromPosition?: number, count?: number): Promise<StoredEvent[]> {
    const all = Array.from(this.streams.values()).flat().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    let result = all;
    if (fromPosition) result = result.slice(fromPosition);
    if (count) result = result.slice(0, count);
    return result;
  }
  
  async getStreamInfo(streamId: string): Promise<StreamInfo | null> {
    const stream = this.streams.get(streamId);
    if (!stream || stream.length === 0) return null;
    return {
      streamId,
      version: stream.length,
      createdAt: stream[0].timestamp,
      updatedAt: stream[stream.length - 1].timestamp
    };
  }
}

export interface AppendResult { streamId: string; nextExpectedVersion: number; position: number; }
export class ConcurrencyError extends Error {
  constructor(public streamId: string, public expected: number, public actual: number) {
    super('Concurrency error: expected ' + expected + ', got ' + actual);
  }
}