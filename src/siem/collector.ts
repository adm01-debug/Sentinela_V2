import { SecurityEvent } from './types';
import { v4 as uuidv4 } from 'uuid';

export class EventCollector {
  private events: SecurityEvent[] = [];
  private listeners: ((event: SecurityEvent) => void)[] = [];
  
  collect(source: string, type: string, severity: SecurityEvent['severity'], data: Record<string, unknown>): SecurityEvent {
    const event: SecurityEvent = { id: uuidv4(), source, type, severity, timestamp: new Date(), data };
    this.events.push(event);
    if (this.events.length > 100000) this.events.shift();
    this.listeners.forEach(l => l(event));
    return event;
  }
  
  subscribe(listener: (event: SecurityEvent) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }
  
  query(filter: Partial<SecurityEvent>, limit?: number): SecurityEvent[] {
    let results = this.events.filter(e => {
      if (filter.source && e.source !== filter.source) return false;
      if (filter.type && e.type !== filter.type) return false;
      if (filter.severity && e.severity !== filter.severity) return false;
      return true;
    });
    return limit ? results.slice(-limit) : results;
  }
  
  getStats(): CollectorStats {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    this.events.forEach(e => {
      byType[e.type] = (byType[e.type] ?? 0) + 1;
      bySeverity[e.severity] = (bySeverity[e.severity] ?? 0) + 1;
    });
    return { total: this.events.length, byType, bySeverity };
  }
}

export interface CollectorStats { total: number; byType: Record<string, number>; bySeverity: Record<string, number>; }