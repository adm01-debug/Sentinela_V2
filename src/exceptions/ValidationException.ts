import { BaseException } from './BaseException';
export class ValidationException extends BaseException {
  readonly errors: Record<string, string[]>;
  constructor(errors: Record<string, string[]>) { super('Validation failed', 422, errors); this.errors = errors; }
  static fromZod(error: any): ValidationException { const errors: Record<string, string[]> = {}; error.issues?.forEach((i: any) => { const path = i.path.join('.') || 'general'; errors[path] = errors[path] || []; errors[path].push(i.message); }); return new ValidationException(errors); }
}
