export interface Rule { id: string; name: string; description?: string; type: RuleType; conditions: RuleCondition[]; actions: RuleAction[]; isActive: boolean; priority: number; schedule?: RuleSchedule; createdAt: string; updatedAt: string; }
export type RuleType = 'monitoring' | 'alert' | 'automation' | 'violation' | 'security';
export interface RuleCondition { field: string; operator: ConditionOperator; value: string | number | boolean | string[]; logic?: 'AND' | 'OR'; }
export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'regex';
export interface RuleAction { type: ActionType; config: Record<string, string | number | boolean>; }
export type ActionType = 'notify' | 'block' | 'log' | 'escalate' | 'webhook' | 'email' | 'slack';
export interface RuleSchedule { timezone: string; days: number[]; startTime: string; endTime: string; }
export interface RuleStats { totalRules: number; activeRules: number; triggeredToday: number; topTriggered: Array<{ ruleId: string; count: number }>; }
