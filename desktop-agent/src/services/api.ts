import fetch from 'node-fetch';
import { Config } from '../config';

export interface ViolationRule {
  id: string;
  rule_type: 'blocked_site' | 'blocked_keyword' | 'blocked_app' | 'blocked_file_extension' | 'work_hours';
  rule_value: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  notify_employee: boolean;
  notify_admin: boolean;
}

export class ApiService {
  private config: Config;
  private queue: Array<{ type: string; data: any }> = [];
  private sending = false;
  private cachedRules: ViolationRule[] = [];
  private lastRulesFetch = 0;
  private rulesCacheTime = 5 * 60 * 1000; // 5 minutes cache

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

  async fetchViolationRules(): Promise<ViolationRule[]> {
    const now = Date.now();
    
    // Return cached rules if still valid
    if (this.cachedRules.length > 0 && (now - this.lastRulesFetch) < this.rulesCacheTime) {
      return this.cachedRules;
    }

    try {
      const response = await fetch(this.config.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-key': this.config.agentKey,
        },
        body: JSON.stringify({ type: 'get_rules', data: {} }),
      });

      if (!response.ok) {
        console.error('Failed to fetch rules:', await response.text());
        return this.cachedRules;
      }

      const result = await response.json() as { rules?: ViolationRule[] };
      this.cachedRules = result.rules || [];
      this.lastRulesFetch = now;
      
      console.log(`Fetched ${this.cachedRules.length} violation rules`);
      return this.cachedRules;
    } catch (error) {
      console.error('Error fetching violation rules:', error);
      return this.cachedRules;
    }
  }

  getRulesByType(type: ViolationRule['rule_type']): ViolationRule[] {
    return this.cachedRules.filter(r => r.rule_type === type && r.is_active);
  }
}
