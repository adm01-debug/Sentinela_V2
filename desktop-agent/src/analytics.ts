interface AnalyticsEvent {
  name: string;
  properties: Record<string, string | number | boolean>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

interface AnalyticsConfig {
  batchSize: number;
  flushInterval: number;
  endpoint?: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private config: AnalyticsConfig;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = {
      batchSize: 100,
      flushInterval: 30000, // 30 seconds
      ...config,
    };
  }

  track(name: string, properties: AnalyticsEvent['properties'] = {}): void {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date(),
    };

    this.events.push(event);

    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      if (this.config.endpoint) {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: eventsToSend }),
        });
      }
    } catch (error) {
      // Re-queue events on failure
      this.events = [...eventsToSend, ...this.events];
      if (process.env.NODE_ENV === 'development') {
        console.error('[Analytics] Flush failed:', error);
      }
    }
  }

  startAutoFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
  }

  stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  getQueueSize(): number {
    return this.events.length;
  }
}

export const analytics = new Analytics();
export type { AnalyticsEvent, AnalyticsConfig };
