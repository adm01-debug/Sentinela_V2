import { describe, it, expect } from 'vitest';
import { capitalize, slugify, isEmpty, clamp } from '../helpers';
describe('helpers', () => {
  it('capitalizes', () => { expect(capitalize('hello')).toBe('Hello'); });
  it('slugifies', () => { expect(slugify('Hello World')).toBe('hello-world'); });
  it('isEmpty', () => { expect(isEmpty('')).toBe(true); expect(isEmpty('a')).toBe(false); });
  it('clamps', () => { expect(clamp(5, 0, 10)).toBe(5); expect(clamp(-5, 0, 10)).toBe(0); });
});