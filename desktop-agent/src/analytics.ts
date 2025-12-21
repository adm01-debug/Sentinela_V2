import { app } from 'electron';
import { logger } from './logger';

class AnalyticsCollector {
  private events: any[] = [];
  track(name: string, props?: Record<string, unknown>) { this.events.push({ name, props, ts: Date.now() }); }
  async flush() { if (this.events.length) { this.events = []; } }
}

export const analytics = new AnalyticsCollector();