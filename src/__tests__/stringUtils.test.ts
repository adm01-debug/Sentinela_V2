import { describe, it, expect } from 'vitest';
import { truncate, capitalize, slugify, initials } from '../utils/string';

describe('string utils', () => {
  it('truncates', () => { expect(truncate('Hello World', 5)).toBe('Hello...'); });
  it('capitalizes', () => { expect(capitalize('hello')).toBe('Hello'); });
  it('slugifies', () => { expect(slugify('Hello World')).toBe('hello-world'); });
  it('gets initials', () => { expect(initials('John Doe')).toBe('JD'); });
});