// URL Utilities Tests for Sentinela v17
import { describe, it, expect } from 'vitest';
import {
  buildUrl,
  parseUrl,
  getQueryParams,
  isAbsoluteUrl,
  isValidUrl,
  joinPaths,
  getPathSegments,
  getDomain,
  normalizeUrl,
} from '../url';

describe('url utilities', () => {
  describe('buildUrl', () => {
    it('should build URL with params', () => {
      const url = buildUrl('https://example.com/api', { page: 1, search: 'test' });
      expect(url).toContain('page=1');
      expect(url).toContain('search=test');
    });

    it('should handle undefined params', () => {
      const url = buildUrl('https://example.com', { a: 'b', c: undefined });
      expect(url).toContain('a=b');
      expect(url).not.toContain('c=');
    });
  });

  describe('parseUrl', () => {
    it('should parse valid URL', () => {
      const url = parseUrl('https://example.com/path?query=1');
      expect(url?.hostname).toBe('example.com');
      expect(url?.pathname).toBe('/path');
    });
  });

  describe('getQueryParams', () => {
    it('should extract query params', () => {
      const params = getQueryParams('https://example.com?a=1&b=2');
      expect(params.a).toBe('1');
      expect(params.b).toBe('2');
    });
  });

  describe('isAbsoluteUrl', () => {
    it('should detect absolute URLs', () => {
      expect(isAbsoluteUrl('https://example.com')).toBe(true);
      expect(isAbsoluteUrl('http://example.com')).toBe(true);
      expect(isAbsoluteUrl('//example.com')).toBe(true);
      expect(isAbsoluteUrl('/path')).toBe(false);
      expect(isAbsoluteUrl('path')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('not a url')).toBe(false);
    });
  });

  describe('joinPaths', () => {
    it('should join paths correctly', () => {
      expect(joinPaths('a', 'b', 'c')).toBe('a/b/c');
      expect(joinPaths('/a/', '/b/', '/c')).toBe('/a/b/c');
      expect(joinPaths('https://example.com', 'api', 'users')).toBe('https://example.com/api/users');
    });
  });

  describe('getPathSegments', () => {
    it('should extract path segments', () => {
      const segments = getPathSegments('https://example.com/api/v1/users');
      expect(segments).toEqual(['api', 'v1', 'users']);
    });
  });

  describe('getDomain', () => {
    it('should extract domain', () => {
      expect(getDomain('https://example.com/path')).toBe('example.com');
      expect(getDomain('https://sub.example.com')).toBe('sub.example.com');
    });
  });

  describe('normalizeUrl', () => {
    it('should normalize URL', () => {
      expect(normalizeUrl('https://example.com//path//to///resource/')).toBe(
        'https://example.com/path/to/resource'
      );
    });
  });
});
