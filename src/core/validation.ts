/**
 * @packageDocumentation
 * @module Core/Validation
 * Input validation utilities
 */
import { ValidationError } from './errors';

export interface ValidationRule<T> {
  validate(value: T): boolean;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Validator class for composable validation
 */
export class Validator<T> {
  private rules: Map<keyof T, ValidationRule<unknown>[]> = new Map();

  addRule<K extends keyof T>(field: K, rule: ValidationRule<T[K]>): this {
    const fieldRules = this.rules.get(field) ?? [];
    fieldRules.push(rule as ValidationRule<unknown>);
    this.rules.set(field, fieldRules);
    return this;
  }

  validate(data: T): ValidationResult {
    const errors: ValidationErrorDetail[] = [];

    this.rules.forEach((rules, field) => {
      const value = data[field as keyof T];
      for (const rule of rules) {
        if (!rule.validate(value)) {
          errors.push({ field: String(field), message: rule.message, value });
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }

  validateOrThrow(data: T): void {
    const result = this.validate(data);
    if (!result.valid) {
      const firstError = result.errors[0];
      throw new ValidationError(firstError.message, firstError.field, firstError.value);
    }
  }
}

/** Common validation rules */
export const Rules = {
  required: <T>(message = 'Field is required'): ValidationRule<T> => ({
    validate: (v) => v !== undefined && v !== null && v !== '',
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (v) => typeof v === 'string' && v.length >= min,
    message: message ?? 'Minimum length is ' + min
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (v) => typeof v === 'string' && v.length <= max,
    message: message ?? 'Maximum length is ' + max
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (v) => typeof v === 'number' && v >= min,
    message: message ?? 'Minimum value is ' + min
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (v) => typeof v === 'number' && v <= max,
    message: message ?? 'Maximum value is ' + max
  }),

  email: (message = 'Invalid email format'): ValidationRule<string> => ({
    validate: (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (v) => typeof v === 'string' && regex.test(v),
    message
  }),

  oneOf: <T>(values: T[], message?: string): ValidationRule<T> => ({
    validate: (v) => values.includes(v),
    message: message ?? 'Must be one of: ' + values.join(', ')
  }),

  custom: <T>(fn: (v: T) => boolean, message: string): ValidationRule<T> => ({
    validate: fn,
    message
  })
};

/** Validate a single value */
export function validate<T>(value: T, rules: ValidationRule<T>[]): ValidationResult {
  const errors: ValidationErrorDetail[] = [];
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push({ field: 'value', message: rule.message, value });
    }
  }
  return { valid: errors.length === 0, errors };
}

/** Assert a condition or throw */
export function assert(condition: boolean, message: string, field?: string): asserts condition {
  if (!condition) {
    throw new ValidationError(message, field);
  }
}
