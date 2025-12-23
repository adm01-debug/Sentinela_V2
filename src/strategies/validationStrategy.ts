export interface ValidationStrategy<T> { validate(data: T): { valid: boolean; errors: string[] }; }
export class RequiredFieldsStrategy<T extends object> implements ValidationStrategy<T> {
  constructor(private fields: (keyof T)[]) {}
  validate(data: T) { const errors: string[] = []; this.fields.forEach(f => { if (!data[f]) errors.push(f + ' is required'); }); return { valid: errors.length === 0, errors }; }
}
export class EmailValidationStrategy implements ValidationStrategy<{ email: string }> {
  validate(data: { email: string }) { const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email); return { valid, errors: valid ? [] : ['Invalid email format'] }; }
}
