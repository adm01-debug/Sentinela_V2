/**
 * @fileoverview Log Aggregator
 * @module @sentinela/core/logAggregation
 */
export interface LogEntry { level: string; message: string; timestamp: number; meta?: Record<string, unknown>; }
export class LogAggregator {
  private logs: LogEntry[] = [];
  add(entry: LogEntry): void { this.logs.push(entry); }
  query(filter: Partial<LogEntry>): LogEntry[] {
    return this.logs.filter(l => (!filter.level || l.level === filter.level));
  }
  count(): number { return this.logs.length; }
  clear(): void { this.logs = []; }
}
