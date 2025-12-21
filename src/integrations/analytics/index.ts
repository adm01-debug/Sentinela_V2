import { createClient } from '@supabase/supabase-js';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp?: string;
}

class AnalyticsClient {
  private enabled = true;
  private queue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  init() {
    this.flushInterval = setInterval(() => this.flush(), 30000);
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  track(name: string, properties?: Record<string, unknown>) {
    if (!this.enabled) return;
    
    this.queue.push({
      name,
      properties,
      timestamp: new Date().toISOString(),
    });

    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  identify(userId: string, traits?: Record<string, unknown>) {
    this.track('identify', { userId, ...traits });
  }

  page(name: string, properties?: Record<string, unknown>) {
    this.track('page_view', { page: name, ...properties });
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Analytics flush failed:', error);
      this.queue.unshift(...events);
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const analytics = new AnalyticsClient();
