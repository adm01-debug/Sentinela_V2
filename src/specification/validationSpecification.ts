// Validation Specification - Business Rules
import { Specification, CompositeSpecification } from "./specification";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field?: string;
  code: string;
  message: string;
}

export interface ValidationSpecification<T> extends Specification<T> {
  validate(candidate: T): ValidationResult;
}

export abstract class BaseValidationSpecification<T> extends CompositeSpecification<T> implements ValidationSpecification<T> {
  abstract validate(candidate: T): ValidationResult;
  
  isSatisfiedBy(candidate: T): boolean {
    return this.validate(candidate).isValid;
  }
}

export class RequiredFieldSpec<T> extends BaseValidationSpecification<T> {
  constructor(private field: keyof T, private message?: string) { super(); }
  
  validate(candidate: T): ValidationResult {
    const value = candidate[this.field];
    const isValid = value !== undefined && value !== null && value !== "";
    return {
      isValid,
      errors: isValid ? [] : [{ field: String(this.field), code: "REQUIRED", message: this.message || \`\${String(this.field)} is required\` }]
    };
  }
}

export class RangeSpec<T> extends BaseValidationSpecification<T> {
  constructor(private field: keyof T, private min: number, private max: number) { super(); }
  
  validate(candidate: T): ValidationResult {
    const value = candidate[this.field] as number;
    const isValid = value >= this.min && value <= this.max;
    return {
      isValid,
      errors: isValid ? [] : [{ field: String(this.field), code: "OUT_OF_RANGE", message: \`\${String(this.field)} must be between \${this.min} and \${this.max}\` }]
    };
  }
}

export class PatternSpec<T> extends BaseValidationSpecification<T> {
  constructor(private field: keyof T, private pattern: RegExp, private message?: string) { super(); }
  
  validate(candidate: T): ValidationResult {
    const value = String(candidate[this.field]);
    const isValid = this.pattern.test(value);
    return {
      isValid,
      errors: isValid ? [] : [{ field: String(this.field), code: "INVALID_FORMAT", message: this.message || \`\${String(this.field)} has invalid format\` }]
    };
  }
}

export class CompositeValidationSpec<T> extends BaseValidationSpecification<T> {
  constructor(private specs: ValidationSpecification<T>[]) { super(); }
  
  validate(candidate: T): ValidationResult {
    const errors: ValidationError[] = [];
    for (const spec of this.specs) {
      const result = spec.validate(candidate);
      errors.push(...result.errors);
    }
    return { isValid: errors.length === 0, errors };
  }
}
