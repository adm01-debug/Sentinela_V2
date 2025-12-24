import { EventData, RecordedEvent, StreamMetadata, AppendResult } from './types';
import { v4 as uuidv4 } from 'uuid';

export class AdvancedEventStore {
  private streams: Map<string, RecordedEvent[]> = new Map();
  private globalLog: RecordedEvent[] = [];
  private metadata: Map<string, StreamMetadata> = new Map();
  
  async appendToStream(streamId: string, events: EventData[], expectedPosition?: number): Promise<AppendResult> {
    const stream = this.streams.get(streamId) ?? [];
    if (expectedPosition !== undefined && stream.length !== expectedPosition) throw new Error('Wrong expected position');
    const recorded: RecordedEvent[] = events.map((e, i) => ({
      ...e, streamId, streamPosition: stream.length + i, globalPosition: this.globalLog.length + i, created: new Date()
    }));
    stream.push(...recorded);
    this.globalLog.push(...recorded);
    this.streams.set(streamId, stream);
    return { nextExpectedStreamPosition: stream.length, logPosition: this.globalLog.length };
  }
  
  async readStream(streamId: string, fromPosition?: number, count?: number): Promise<RecordedEvent[]> {
    let events = this.streams.get(streamId) ?? [];
    if (fromPosition !== undefined) events = events.slice(fromPosition);
    if (count !== undefined) events = events.slice(0, count);
    return events;
  }
  
  async readAll(fromPosition?: number, count?: number): Promise<RecordedEvent[]> {
    let events = this.globalLog;
    if (fromPosition !== undefined) events = events.slice(fromPosition);
    if (count !== undefined) events = events.slice(0, count);
    return events;
  }
  
  async setStreamMetadata(streamId: string, metadata: StreamMetadata): Promise<void> { this.metadata.set(streamId, metadata); }
  async getStreamMetadata(streamId: string): Promise<StreamMetadata | undefined> { return this.metadata.get(streamId); }
  async deleteStream(streamId: string): Promise<void> { this.streams.delete(streamId); }
}