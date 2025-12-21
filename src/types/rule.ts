export interface Rule {
  id: string;
  name: string;
  description: string;
  type: 'violation' | 'alert' | 'automation';
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'regex';
  value: string | number;
  logicalOperator?: 'and' | 'or';
}

export interface RuleAction {
  type: 'notify' | 'block' | 'log' | 'webhook';
  parameters: Record<string, unknown>;
}
