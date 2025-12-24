import { IntrusionEvent } from './intrusionDetector';
export class IntrusionLog {
  private logs: IntrusionEvent[] = [];
  log(event: IntrusionEvent): void { this.logs.push(event); }
  getAll(): IntrusionEvent[] { return [...this.logs]; }
  getByDateRange(start: Date, end: Date): IntrusionEvent[] { return this.logs.filter(e => e.timestamp >= start && e.timestamp <= end); }
  getBySource(source: string): IntrusionEvent[] { return this.logs.filter(e => e.source === source); }
  export(): string { return JSON.stringify(this.logs, null, 2); }
  clear(): void { this.logs = []; }
}
export const intrusionLog = new IntrusionLog();
