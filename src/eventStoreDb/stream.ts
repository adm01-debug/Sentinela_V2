import { RecordedEvent, StreamMetadata } from './types';

export class EventStream {
  private events: RecordedEvent[] = [];
  
  constructor(public readonly streamId: string, private metadata?: StreamMetadata) {}
  
  append(event: RecordedEvent): void {
    this.events.push(event);
    this.enforceRetention();
  }
  
  read(fromPosition?: number, count?: number): RecordedEvent[] {
    let events = fromPosition ? this.events.filter(e => e.streamPosition >= fromPosition) : this.events;
    if (count !== undefined) events = events.slice(0, count);
    return events;
  }
  
  getVersion(): number { return this.events.length; }
  getLastEvent(): RecordedEvent | undefined { return this.events[this.events.length - 1]; }
  
  private enforceRetention(): void {
    if (this.metadata?.maxCount && this.events.length > this.metadata.maxCount) {
      this.events = this.events.slice(-this.metadata.maxCount);
    }
    if (this.metadata?.maxAge) {
      const cutoff = Date.now() - this.metadata.maxAge;
      this.events = this.events.filter(e => e.created.getTime() > cutoff);
    }
  }
}