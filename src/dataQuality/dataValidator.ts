export type ValidationRule = { type: 'required' | 'type' | 'range' | 'pattern' | 'custom'; field: string; value?: any; message?: string; };
export class DataValidator {
  private rules: ValidationRule[] = [];
  addRule(rule: ValidationRule): void { this.rules.push(rule); }
  validate(data: Record<string, any>): { valid: boolean; errors: string[] } { const errors: string[] = []; for (const rule of this.rules) { const value = data[rule.field]; switch (rule.type) { case 'required': if (value === undefined || value === null || value === '') errors.push(rule.message || rule.field + ' is required'); break; case 'type': if (typeof value !== rule.value) errors.push(rule.message || rule.field + ' must be ' + rule.value); break; case 'range': if (value < rule.value.min || value > rule.value.max) errors.push(rule.message || rule.field + ' out of range'); break; case 'pattern': if (!new RegExp(rule.value).test(value)) errors.push(rule.message || rule.field + ' invalid format'); break; } } return { valid: errors.length === 0, errors }; }
  clear(): void { this.rules = []; }
}
export const dataValidator = new DataValidator();
