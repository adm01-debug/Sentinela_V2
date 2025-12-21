export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  actions: AlertAction[];
  enabled: boolean;
}

export interface AlertAction {
  type: 'email' | 'slack' | 'webhook' | 'push';
  target: string;
  template?: string;
}

export interface AlertStats {
  total: number;
  unacknowledged: number;
  bySeverity: Record<Alert['severity'], number>;
}
