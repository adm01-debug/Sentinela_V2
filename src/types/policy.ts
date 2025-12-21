export interface Policy {
  id: string;
  name: string;
  description: string;
  type: 'monitoring' | 'security' | 'access' | 'compliance';
  rules: PolicyRule[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: 'allow' | 'block' | 'warn' | 'log';
  priority: number;
}

export interface PolicyAcknowledgment {
  id: string;
  policyId: string;
  userId: string;
  acknowledgedAt: string;
  version: string;
}
