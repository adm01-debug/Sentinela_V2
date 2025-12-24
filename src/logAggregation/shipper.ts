import { LogEntry } from './types';

export class LogShipper {
  private buffer: LogEntry[] = [];
  private destinations: LogDestination[] = [];
  
  addDestination(dest: LogDestination): void { this.destinations.push(dest); }
  
  ship(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length >= 100) this.flush();
  }
  
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.buffer.length);
    await Promise.all(this.destinations.map(d => d.send(batch)));
  }
}

export interface LogDestination { send(entries: LogEntry[]): Promise<void>; }

export class ConsoleDestination implements LogDestination {
  async send(entries: LogEntry[]): Promise<void> { entries.forEach(e => console.log(e.message)); }
}

export class HttpDestination implements LogDestination {
  constructor(private url: string) {}
  async send(entries: LogEntry[]): Promise<void> { console.log('Shipping', entries.length, 'logs to', this.url); }
}