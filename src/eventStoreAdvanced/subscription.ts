import { RecordedEvent } from './types';
import { AdvancedEventStore } from './store';

export class PersistentSubscription {
  private handlers: Array<(event: RecordedEvent) => Promise<void>> = [];
  private running: boolean = false;
  private position: number = 0;
  
  constructor(private store: AdvancedEventStore, private groupName: string, private streamId?: string) {}
  
  onEvent(handler: (event: RecordedEvent) => Promise<void>): void { this.handlers.push(handler); }
  
  async start(): Promise<void> {
    this.running = true;
    while (this.running) {
      const events = this.streamId 
        ? await this.store.readStream(this.streamId, this.position, 100)
        : await this.store.readAll(this.position, 100);
      for (const event of events) {
        await Promise.all(this.handlers.map(h => h(event)));
        this.position = (this.streamId ? event.streamPosition : event.globalPosition) + 1;
      }
      if (events.length === 0) await new Promise(r => setTimeout(r, 100));
    }
  }
  
  stop(): void { this.running = false; }
  getPosition(): number { return this.position; }
}

export class CatchUpSubscription extends PersistentSubscription {
  async catchUp(): Promise<void> {
    const events = await (this as any).store.readAll(0);
    for (const event of events) await Promise.all((this as any).handlers.map((h: any) => h(event)));
  }
}