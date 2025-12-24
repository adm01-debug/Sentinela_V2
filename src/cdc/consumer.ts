import { ChangeEvent } from './types';

export class CDCConsumer {
  private handlers: Map<string, (event: ChangeEvent) => Promise<void>> = new Map();
  
  on(table: string, handler: (event: ChangeEvent) => Promise<void>): void {
    this.handlers.set(table, handler);
  }
  
  async process(event: ChangeEvent): Promise<void> {
    const handler = this.handlers.get(event.table) ?? this.handlers.get('*');
    if (handler) await handler(event);
  }
  
  async processBatch(events: ChangeEvent[]): Promise<ProcessResult> {
    const result: ProcessResult = { processed: 0, failed: 0, errors: [] };
    for (const event of events) {
      try { await this.process(event); result.processed++; }
      catch (e) { result.failed++; result.errors.push({ eventId: event.id, error: (e as Error).message }); }
    }
    return result;
  }
}

export interface ProcessResult { processed: number; failed: number; errors: { eventId: string; error: string }[]; }