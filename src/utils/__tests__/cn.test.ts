import { describe, it, expect } from 'vitest';

// Mock cn function (classnames utility)
const cn = (...inputs: (string | undefined | null | false | Record<string, boolean>)[]) => {
  return inputs
    .filter(Boolean)
    .map(input => {
      if (typeof input === 'string') return input;
      if (typeof input === 'object') {
        return Object.entries(input)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
};

describe('cn (classnames utility)', () => {
  describe('basic usage', () => {
    it('should join multiple class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle single class name', () => {
      expect(cn('foo')).toBe('foo');
    });

    it('should return empty string for no arguments', () => {
      expect(cn()).toBe('');
    });
  });

  describe('falsy values', () => {
    it('should filter out undefined', () => {
      expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    });

    it('should filter out null', () => {
      expect(cn('foo', null, 'bar')).toBe('foo bar');
    });

    it('should filter out false', () => {
      expect(cn('foo', false, 'bar')).toBe('foo bar');
    });

    it('should filter out empty strings', () => {
      expect(cn('foo', '', 'bar')).toBe('foo bar');
    });
  });

  describe('conditional classes', () => {
    it('should include class when condition is true', () => {
      const isActive = true;
      expect(cn('btn', isActive && 'btn-active')).toBe('btn btn-active');
    });

    it('should exclude class when condition is false', () => {
      const isActive = false;
      expect(cn('btn', isActive && 'btn-active')).toBe('btn');
    });

    it('should handle ternary conditions', () => {
      const variant = 'primary';
      expect(cn('btn', variant === 'primary' ? 'btn-primary' : 'btn-secondary')).toBe('btn btn-primary');
    });
  });

  describe('object syntax', () => {
    it('should include classes with truthy values', () => {
      expect(cn({ foo: true, bar: true })).toBe('foo bar');
    });

    it('should exclude classes with falsy values', () => {
      expect(cn({ foo: true, bar: false })).toBe('foo');
    });

    it('should handle mixed object and string', () => {
      expect(cn('base', { active: true, disabled: false })).toBe('base active');
    });
  });

  describe('Tailwind-specific patterns', () => {
    it('should handle responsive prefixes', () => {
      expect(cn('p-4', 'md:p-6', 'lg:p-8')).toBe('p-4 md:p-6 lg:p-8');
    });

    it('should handle state variants', () => {
      expect(cn('bg-blue-500', 'hover:bg-blue-600', 'focus:ring-2')).toBe('bg-blue-500 hover:bg-blue-600 focus:ring-2');
    });

    it('should handle dark mode classes', () => {
      expect(cn('bg-white', 'dark:bg-gray-900')).toBe('bg-white dark:bg-gray-900');
    });
  });

  describe('edge cases', () => {
    it('should handle multiple spaces', () => {
      expect(cn('foo  bar')).toBe('foo  bar');
    });

    it('should preserve class order', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c');
    });

    it('should handle complex combinations', () => {
      const result = cn(
        'base-class',
        true && 'conditional-true',
        false && 'conditional-false',
        { 'object-true': true, 'object-false': false },
        undefined,
        null,
        'final-class'
      );
      expect(result).toBe('base-class conditional-true object-true final-class');
    });
  });
});
