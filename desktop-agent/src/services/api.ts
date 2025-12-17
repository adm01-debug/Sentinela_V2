import fetch from 'node-fetch';
import { Config } from '../config';

export class ApiService {
  private config: Config;
  private queue: Array<{ type: string; data: any }> = [];
  private sending = false;

  constructor(config: Config) {
    this.config = config;
    
    // Process queue every 5 seconds
    setInterval(() => this.processQueue(), 5000);
  }

  async send(type: string, data: any): Promise<boolean> {
    this.queue.push({ type, data: { ...data, employee_name: this.config.employeeName, device: this.config.deviceName } });
    return true;
  }

  private async processQueue() {
    if (this.sending || this.queue.length === 0) return;
    
    this.sending = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        const response = await fetch(this.config.serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-agent-key': this.config.agentKey,
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          console.error('API error:', await response.text());
          // Re-queue on failure (max 3 times tracked by a counter would be better)
          this.queue.unshift(item);
          break;
        }
      } catch (error) {
        console.error('Network error:', error);
        this.queue.unshift(item);
        break;
      }
    }
    
    this.sending = false;
  }

  async heartbeat() {
    return this.send('heartbeat', { timestamp: new Date().toISOString() });
  }
}
