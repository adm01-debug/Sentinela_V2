/**
 * @jest-environment node
 */
import { Validator, Rules, validate, assert } from '../../src/core/validation';
import { ValidationError } from '../../src/core/errors';

describe('Validator', () => {
  interface User {
    name: string;
    email: string;
    age: number;
  }

  it('should validate successfully', () => {
    const validator = new Validator<User>()
      .addRule('name', Rules.required())
      .addRule('email', Rules.email());

    const result = validator.validate({ name: 'John', email: 'john@example.com', age: 25 });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return errors for invalid data', () => {
    const validator = new Validator<User>()
      .addRule('name', Rules.required())
      .addRule('email', Rules.email());

    const result = validator.validate({ name: '', email: 'not-an-email', age: 25 });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should throw on validateOrThrow', () => {
    const validator = new Validator<User>()
      .addRule('name', Rules.required());

    expect(() => validator.validateOrThrow({ name: '', email: '', age: 0 }))
      .toThrow(ValidationError);
  });
});

describe('Rules', () => {
  it('required should validate non-empty values', () => {
    const rule = Rules.required<string>();
    expect(rule.validate('value')).toBe(true);
    expect(rule.validate('')).toBe(false);
    expect(rule.validate(null as unknown as string)).toBe(false);
  });

  it('minLength should validate string length', () => {
    const rule = Rules.minLength(3);
    expect(rule.validate('abc')).toBe(true);
    expect(rule.validate('ab')).toBe(false);
  });

  it('maxLength should validate string length', () => {
    const rule = Rules.maxLength(5);
    expect(rule.validate('abc')).toBe(true);
    expect(rule.validate('abcdef')).toBe(false);
  });

  it('min should validate number', () => {
    const rule = Rules.min(10);
    expect(rule.validate(10)).toBe(true);
    expect(rule.validate(9)).toBe(false);
  });

  it('max should validate number', () => {
    const rule = Rules.max(10);
    expect(rule.validate(10)).toBe(true);
    expect(rule.validate(11)).toBe(false);
  });

  it('email should validate email format', () => {
    const rule = Rules.email();
    expect(rule.validate('test@example.com')).toBe(true);
    expect(rule.validate('not-an-email')).toBe(false);
  });

  it('pattern should validate regex', () => {
    const rule = Rules.pattern(/^[A-Z]+$/);
    expect(rule.validate('ABC')).toBe(true);
    expect(rule.validate('abc')).toBe(false);
  });

  it('oneOf should validate against list', () => {
    const rule = Rules.oneOf(['a', 'b', 'c']);
    expect(rule.validate('a')).toBe(true);
    expect(rule.validate('d')).toBe(false);
  });

  it('custom should use custom function', () => {
    const rule = Rules.custom<number>(v => v % 2 === 0, 'Must be even');
    expect(rule.validate(2)).toBe(true);
    expect(rule.validate(3)).toBe(false);
  });
});

describe('validate', () => {
  it('should validate single value', () => {
    const result = validate('test', [Rules.minLength(2)]);
    expect(result.valid).toBe(true);
  });
});

describe('assert', () => {
  it('should not throw for true condition', () => {
    expect(() => assert(true, 'Error')).not.toThrow();
  });

  it('should throw ValidationError for false condition', () => {
    expect(() => assert(false, 'Error', 'field')).toThrow(ValidationError);
  });
});
