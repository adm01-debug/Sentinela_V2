/**
 * @fileoverview Validation utilities
 * @module @sentinela/core/validation
 */

import { ValidationError } from './errors';

export type Validator<T> = (value: T) => ValidationResult;

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
 * Validate required field
 */
export function required(field: string): Validator<unknown> {
  return (value) => {
    const valid = value !== undefined && value !== null && value !== '';
    return {
      valid,
      errors: valid ? [] : [{ field, message: `${field} is required`, value }]
    };
  };
}

/**
 * Validate string min length
 */
export function minLength(field: string, min: number): Validator<string> {
  return (value) => {
    const valid = typeof value === 'string' && value.length >= min;
    return {
      valid,
      errors: valid ? [] : [{ field, message: `${field} must be at least ${min} characters`, value }]
    };
  };
}

/**
 * Validate string max length
 */
export function maxLength(field: string, max: number): Validator<string> {
  return (value) => {
    const valid = typeof value === 'string' && value.length <= max;
    return {
      valid,
      errors: valid ? [] : [{ field, message: `${field} must be at most ${max} characters`, value }]
    };
  };
}

/**
 * Validate email format
 */
export function email(field: string): Validator<string> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (value) => {
    const valid = typeof value === 'string' && emailRegex.test(value);
    return {
      valid,
      errors: valid ? [] : [{ field, message: `${field} must be a valid email address`, value }]
    };
  };
}

/**
 * Validate number range
 */
export function range(field: string, min: number, max: number): Validator<number> {
  return (value) => {
    const valid = typeof value === 'number' && value >= min && value <= max;
    return {
      valid,
      errors: valid ? [] : [{ field, message: `${field} must be between ${min} and ${max}`, value }]
    };
  };
}

/**
 * Validate pattern
 */
export function pattern(field: string, regex: RegExp, message?: string): Validator<string> {
  return (value) => {
    const valid = typeof value === 'string' && regex.test(value);
    return {
      valid,
      errors: valid ? [] : [{ field, message: message || `${field} format is invalid`, value }]
    };
  };
}

/**
 * Combine multiple validators
 */
export function combine<T>(...validators: Validator<T>[]): Validator<T> {
  return (value) => {
    const allErrors: ValidationErrorDetail[] = [];
    for (const validator of validators) {
      const result = validator(value);
      allErrors.push(...result.errors);
    }
    return { valid: allErrors.length === 0, errors: allErrors };
  };
}

/**
 * Validate object with schema
 */
export function validateObject<T extends Record<string, unknown>>(
  obj: T,
  schema: Record<keyof T, Validator<unknown>[]>
): ValidationResult {
  const allErrors: ValidationErrorDetail[] = [];
  
  for (const [field, validators] of Object.entries(schema)) {
    const value = obj[field as keyof T];
    for (const validator of validators as Validator<unknown>[]) {
      const result = validator(value);
      allErrors.push(...result.errors);
    }
  }
  
  return { valid: allErrors.length === 0, errors: allErrors };
}

/**
 * Assert validation passes or throw
 */
export function assertValid(result: ValidationResult): void {
  if (!result.valid) {
    const firstError = result.errors[0];
    throw new ValidationError(
      firstError.message,
      firstError.field,
      firstError.value,
      { allErrors: result.errors }
    );
  }
}
