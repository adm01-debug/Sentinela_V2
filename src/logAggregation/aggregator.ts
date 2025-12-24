import { LogEntry, LogQuery, LogLevel } from './types';

export class LogAggregator {
  private logs: LogEntry[] = [];
  private maxSize: number;
  
  constructor(maxSize: number = 100000) { this.maxSize = maxSize; }
  
  ingest(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxSize) this.logs.shift();
  }
  
  query(q: LogQuery, limit: number = 100): LogEntry[] {
    return this.logs.filter(log => {
      if (q.level && log.level !== q.level) return false;
      if (q.source && log.source !== q.source) return false;
      if (q.from && log.timestamp < q.from) return false;
      if (q.to && log.timestamp > q.to) return false;
      if (q.search && !log.message.includes(q.search)) return false;
      return true;
    }).slice(-limit);
  }
  
  getStats(): LogStats {
    const byLevel: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    this.logs.forEach(log => {
      byLevel[log.level] = (byLevel[log.level] ?? 0) + 1;
      bySource[log.source] = (bySource[log.source] ?? 0) + 1;
    });
    return { total: this.logs.length, byLevel, bySource };
  }
}

export interface LogStats { total: number; byLevel: Record<string, number>; bySource: Record<string, number>; }