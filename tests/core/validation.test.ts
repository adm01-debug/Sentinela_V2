import { 
  required, 
  minLength, 
  maxLength, 
  email, 
  range, 
  pattern,
  combine,
  validateObject,
  assertValid
} from '../../core/validation';
import { ValidationError } from '../../core/errors';

describe('Validators', () => {
  describe('required', () => {
    it('should pass for valid value', () => {
      const result = required('name')('John');
      expect(result.valid).toBe(true);
    });

    it('should fail for empty string', () => {
      const result = required('name')('');
      expect(result.valid).toBe(false);
    });

    it('should fail for null', () => {
      const result = required('name')(null);
      expect(result.valid).toBe(false);
    });
  });

  describe('minLength', () => {
    it('should pass for long enough string', () => {
      const result = minLength('password', 8)('password123');
      expect(result.valid).toBe(true);
    });

    it('should fail for short string', () => {
      const result = minLength('password', 8)('short');
      expect(result.valid).toBe(false);
    });
  });

  describe('email', () => {
    it('should pass for valid email', () => {
      const result = email('email')('test@example.com');
      expect(result.valid).toBe(true);
    });

    it('should fail for invalid email', () => {
      const result = email('email')('invalid');
      expect(result.valid).toBe(false);
    });
  });

  describe('range', () => {
    it('should pass for value in range', () => {
      const result = range('age', 18, 100)(25);
      expect(result.valid).toBe(true);
    });

    it('should fail for value out of range', () => {
      const result = range('age', 18, 100)(15);
      expect(result.valid).toBe(false);
    });
  });
});

describe('combine', () => {
  it('should combine multiple validators', () => {
    const validator = combine(
      required('field'),
      minLength('field', 3)
    );
    
    const result = validator('ab');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(1);
  });
});

describe('validateObject', () => {
  it('should validate object schema', () => {
    const result = validateObject(
      { name: 'Jo', email: 'invalid' },
      {
        name: [required('name'), minLength('name', 3)],
        email: [required('email'), email('email')]
      }
    );
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(2);
  });
});

describe('assertValid', () => {
  it('should throw ValidationError on invalid', () => {
    const result = { valid: false, errors: [{ field: 'test', message: 'Invalid' }] };
    expect(() => assertValid(result)).toThrow(ValidationError);
  });

  it('should not throw on valid', () => {
    const result = { valid: true, errors: [] };
    expect(() => assertValid(result)).not.toThrow();
  });
});
