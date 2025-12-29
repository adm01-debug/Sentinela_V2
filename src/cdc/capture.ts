import { ChangeEvent, CDCConfig, SourceInfo } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ChangeDataCapture {
  private running: boolean = false;
  private handlers: ((event: ChangeEvent) => Promise<void>)[] = [];
  
  constructor(private config: CDCConfig) {}
  
  start(): void { this.running = true; if (import.meta.env.DEV) console.log('CDC started for:', this.config.tables); }
  stop(): void { this.running = false; }
  
  onEvent(handler: (event: ChangeEvent) => Promise<void>): () => void {
    this.handlers.push(handler);
    return () => { this.handlers = this.handlers.filter(h => h !== handler); };
  }
  
  async processChange(table: string, operation: ChangeEvent['operation'], before?: Record<string, unknown>, after?: Record<string, unknown>): Promise<void> {
    if (!this.running) return;
    const event: ChangeEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      operation,
      table,
      schema: 'public',
      before,
      after,
      source: { connector: 'cdc', database: this.config.database, snapshot: false, position: Date.now().toString() }
    };
    await Promise.all(this.handlers.map(h => h(event)));
  }
  
  isRunning(): boolean { return this.running; }
}