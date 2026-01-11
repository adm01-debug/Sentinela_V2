export interface Alert {
  id: string;
  type: 'security' | 'productivity' | 'policy' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  employeeId?: string;
  employeeName?: string;
  rule?: string;
  metadata?: Record<string, unknown>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface AlertRule {
  id: string;
  name: string;
  type: Alert['type'];
  severity: Alert['severity'];
  enabled: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
}

export interface AlertCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'regex';
  value: string | number;
}

export interface AlertAction {
  type: 'email' | 'slack' | 'webhook' | 'dashboard';
  config: Record<string, unknown>;
}