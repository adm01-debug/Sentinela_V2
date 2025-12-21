export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details: Record<string, unknown>;
  resolved: boolean;
}

export type SecurityEventType =
  | 'login_failed'
  | 'login_success'
  | 'password_changed'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'unauthorized_access';

export interface SecurityPolicy {
  id: string;
  name: string;
  rules: SecurityRule[];
  enabled: boolean;
  priority: number;
}

export interface SecurityRule {
  condition: string;
  action: 'allow' | 'block' | 'alert' | 'log';
  rateLimit?: { requests: number; window: number };
}
