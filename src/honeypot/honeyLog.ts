import { TrapEvent } from './trapDetector';
import { HoneyToken } from './honeyToken';
export interface HoneyLogEntry { timestamp: Date; type: 'token_triggered' | 'endpoint_accessed' | 'trap_detected'; source: string; details: any; }
export class HoneyLog {
  private entries: HoneyLogEntry[] = [];
  log(type: HoneyLogEntry['type'], source: string, details: any): void { this.entries.push({ timestamp: new Date(), type, source, details }); }
  getAll(): HoneyLogEntry[] { return [...this.entries]; }
  getByType(type: HoneyLogEntry['type']): HoneyLogEntry[] { return this.entries.filter(e => e.type === type); }
  export(): string { return JSON.stringify(this.entries, null, 2); }
}
export const honeyLog = new HoneyLog();
