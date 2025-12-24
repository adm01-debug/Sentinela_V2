import { RecordedEvent } from './types';

export class EventSubscription {
  private handlers: ((event: RecordedEvent) => Promise<void>)[] = [];
  private position: number = 0;
  private running: boolean = false;
  
  constructor(private streamId: string | '$all') {}
  
  on(handler: (event: RecordedEvent) => Promise<void>): void { this.handlers.push(handler); }
  
  async handle(event: RecordedEvent): Promise<void> {
    for (const handler of this.handlers) await handler(event);
    this.position = event.globalPosition;
  }
  
  start(): void { this.running = true; }
  stop(): void { this.running = false; }
  isRunning(): boolean { return this.running; }
  getPosition(): number { return this.position; }
}

export class PersistentSubscription extends EventSubscription {
  private checkpointPosition: number = 0;
  
  checkpoint(): void { this.checkpointPosition = this.getPosition(); }
  getCheckpoint(): number { return this.checkpointPosition; }
  
  async ack(event: RecordedEvent): Promise<void> { this.checkpoint(); }
  async nack(event: RecordedEvent, reason: string): Promise<void> { console.log('Nacked:', event.eventId, reason); }
}