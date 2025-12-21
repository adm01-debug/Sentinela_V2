interface Rule { field: string; operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt'; value: unknown; }

export function evaluateRule(data: Record<string, unknown>, rule: Rule): boolean {
  const fieldValue = data[rule.field];
  switch (rule.operator) {
    case 'eq': return fieldValue === rule.value;
    case 'neq': return fieldValue !== rule.value;
    case 'contains': return String(fieldValue).includes(String(rule.value));
    case 'gt': return Number(fieldValue) > Number(rule.value);
    case 'lt': return Number(fieldValue) < Number(rule.value);
    default: return false;
  }
}