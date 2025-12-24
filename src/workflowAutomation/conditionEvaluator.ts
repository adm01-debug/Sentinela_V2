export type Operator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
export interface Condition { field: string; operator: Operator; value: any; }
export interface ConditionGroup { logic: 'and' | 'or'; conditions: (Condition | ConditionGroup)[]; }
export class ConditionEvaluator {
  evaluate(condition: Condition | ConditionGroup, context: Record<string, any>): boolean { if ('logic' in condition) { const results = condition.conditions.map(c => this.evaluate(c, context)); return condition.logic === 'and' ? results.every(Boolean) : results.some(Boolean); } const value = this.getValue(context, condition.field); switch (condition.operator) { case 'eq': return value === condition.value; case 'neq': return value !== condition.value; case 'gt': return value > condition.value; case 'gte': return value >= condition.value; case 'lt': return value < condition.value; case 'lte': return value <= condition.value; case 'contains': return String(value).includes(condition.value); case 'startsWith': return String(value).startsWith(condition.value); case 'endsWith': return String(value).endsWith(condition.value); default: return false; } }
  private getValue(obj: any, path: string): any { return path.split('.').reduce((o, k) => o?.[k], obj); }
}
export const conditionEvaluator = new ConditionEvaluator();
