import { ChangeEvent } from './types';

export class CDCPublisher {
  private subscribers: ((events: ChangeEvent[]) => Promise<void>)[] = [];
  
  subscribe(handler: (events: ChangeEvent[]) => Promise<void>): () => void {
    this.subscribers.push(handler);
    return () => { this.subscribers = this.subscribers.filter(s => s !== handler); };
  }
  
  async publish(events: ChangeEvent[]): Promise<void> {
    await Promise.all(this.subscribers.map(s => s(events)));
  }
  
  async publishOne(event: ChangeEvent): Promise<void> {
    await this.publish([event]);
  }
}

export class BatchPublisher {
  private buffer: ChangeEvent[] = [];
  private timer?: NodeJS.Timeout;
  
  constructor(private publisher: CDCPublisher, private batchSize: number, private flushInterval: number) {}
  
  add(event: ChangeEvent): void {
    this.buffer.push(event);
    if (this.buffer.length >= this.batchSize) this.flush();
    else this.scheduleFlush();
  }
  
  private scheduleFlush(): void {
    if (!this.timer) this.timer = setTimeout(() => this.flush(), this.flushInterval);
  }
  
  async flush(): Promise<void> {
    if (this.timer) { clearTimeout(this.timer); this.timer = undefined; }
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.batchSize);
    await this.publisher.publish(batch);
  }
}