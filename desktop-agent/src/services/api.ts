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

export interface ScheduleInfo {
  name: string;
  work_days: number[];
  start_time: string;
  end_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
  grace_period_minutes: number;
  auto_block_enabled: boolean;
  allow_overtime: boolean;
}

export interface ScheduleResponse {
  schedule: ScheduleInfo | null;
  block_station: boolean;
  reason: string;
  is_lunch_break: boolean;
  current_time: string;
  is_work_day: boolean;
}

export class ApiService {
  private config: Config;
  private queue: Array<{ type: string; data: any }> = [];
  private sending = false;
  private cachedRules: ViolationRule[] = [];
  private lastRulesFetch = 0;
  private rulesCacheTime = 5 * 60 * 1000; // 5 minutes cache
  private scheduleUrl: string;

  constructor(config: Config) {
    this.config = config;
    // Extract base URL for schedule endpoint
    const baseUrl = config.serverUrl.replace('/agent-collector', '');
    this.scheduleUrl = `${baseUrl}/get-employee-schedule`;
    
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

  async fetchEmployeeSchedule(): Promise<ScheduleResponse> {
    try {
      console.log('Fetching employee schedule from:', this.scheduleUrl);
      
      const response = await fetch(this.scheduleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_name: this.config.employeeName,
          agent_key: this.config.agentKey,
        }),
      });

      if (!response.ok) {
        console.error('Failed to fetch schedule:', await response.text());
        return {
          schedule: null,
          block_station: false,
          reason: 'Failed to fetch schedule',
          is_lunch_break: false,
          current_time: new Date().toISOString(),
          is_work_day: true,
        };
      }

      const result = await response.json() as ScheduleResponse;
      console.log('Schedule response:', result);
      return result;
    } catch (error) {
      console.error('Error fetching employee schedule:', error);
      return {
        schedule: null,
        block_station: false,
        reason: 'Network error',
        is_lunch_break: false,
        current_time: new Date().toISOString(),
        is_work_day: true,
      };
    }
  }

  async requestOvertime(reason: string, hoursRequested: number = 2): Promise<{ success: boolean; message: string; request?: any }> {
    const overtimeUrl = this.config.serverUrl.replace('/agent-collector', '/request-overtime');
    
    try {
      console.log('Requesting overtime from:', overtimeUrl);
      
      const response = await fetch(overtimeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_name: this.config.employeeName,
          agent_key: this.config.agentKey,
          reason: reason,
          hours_requested: hoursRequested,
        }),
      });

      const result = await response.json() as { success: boolean; message?: string; error?: string; request?: any };
      
      if (!response.ok || !result.success) {
        console.error('Failed to request overtime:', result.error || result.message);
        return {
          success: false,
          message: result.error || result.message || 'Failed to request overtime',
        };
      }

      console.log('Overtime request submitted:', result);
      return {
        success: true,
        message: result.message || 'Overtime request submitted successfully',
        request: result.request,
      };
    } catch (error) {
      console.error('Error requesting overtime:', error);
      return {
        success: false,
        message: 'Network error while requesting overtime',
      };
    }
  }
}
