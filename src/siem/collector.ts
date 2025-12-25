/**
 * @fileoverview SIEM Collector implementation
 * @module @sentinela/core/siem
 * @version 13.0.0
 */

export interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: Date;
  userId?: string;
  details: Record<string, unknown>;
}

export interface SIEMConfig {
  endpoint: string;
  batchSize?: number;
  flushInterval?: number;
}

export class SIEMCollector {
  private events: SecurityEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(private config: SIEMConfig) {
    const interval = config.flushInterval ?? 5000;
    this.flushTimer = setInterval(() => this.flush(), interval);
  }

  async collect(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    this.events.push({ ...event, timestamp: new Date() });
    const batchSize = this.config.batchSize ?? 100;
    if (this.events.length >= batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.events.length === 0) return;
    const toSend = [...this.events];
    this.events = [];
    // In real impl: send to SIEM endpoint
    console.log('Flushing', toSend.length, 'events to SIEM');
  }

  pendingEvents(): number {
    return this.events.length;
  }

  dispose(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
  }
}
