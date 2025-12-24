import { ConfigEntry } from './types';
import { ConfigClient } from './client';

export class ConfigWatcher {
  private callbacks: Map<string, Set<(value: unknown) => void>> = new Map();
  private pollingInterval?: NodeJS.Timeout;
  
  constructor(private client: ConfigClient) {}
  
  watch(key: string, callback: (value: unknown) => void): () => void {
    const callbacks = this.callbacks.get(key) ?? new Set();
    callbacks.add(callback);
    this.callbacks.set(key, callbacks);
    return () => callbacks.delete(callback);
  }
  
  startPolling(intervalMs: number = 30000): void {
    this.pollingInterval = setInterval(async () => {
      await this.client.refresh();
      for (const [key, callbacks] of this.callbacks) {
        const value = await this.client.get(key);
        callbacks.forEach(cb => cb(value));
      }
    }, intervalMs);
  }
  
  stopPolling(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }
}