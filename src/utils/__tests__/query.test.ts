import { describe, it, expect } from 'vitest';
import { stringifyQuery, parseQuery, mergeQuery, removeQueryParam } from '../query';

describe('query utilities', () => {
  it('should stringify query object', () => {
    expect(stringifyQuery({ a: '1', b: '2' })).toBe('a=1&b=2');
  });

  it('should parse query string', () => {
    const result = parseQuery('a=1&b=2');
    expect(result.a).toBe('1');
    expect(result.b).toBe('2');
  });

  it('should merge queries', () => {
    const result = mergeQuery('a=1', { b: '2' });
    expect(result).toContain('a=1');
    expect(result).toContain('b=2');
  });

  it('should remove query param', () => {
    const result = removeQueryParam('a=1&b=2', 'a');
    expect(result).not.toContain('a=');
    expect(result).toContain('b=2');
  });
});
