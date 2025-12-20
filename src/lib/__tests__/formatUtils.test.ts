import { describe, it, expect } from 'vitest';
import { formatBytes, formatDuration, formatNumber, truncate, getInitials, capitalize, slugify } from '../formatUtils';

describe('formatUtils', () => {
  describe('formatBytes', () => {
    it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 Bytes'); });
    it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB'); });
    it('formats megabytes', () => { expect(formatBytes(1024 * 1024)).toBe('1 MB'); });
  });

  describe('formatDuration', () => {
    it('formats seconds', () => { expect(formatDuration(45)).toBe('45s'); });
    it('formats minutes', () => { expect(formatDuration(125)).toBe('2m 5s'); });
    it('formats hours', () => { expect(formatDuration(3665)).toBe('1h 1m'); });
  });

  describe('truncate', () => {
    it('truncates long string', () => { expect(truncate('Hello World', 5)).toBe('Hello...'); });
    it('keeps short string', () => { expect(truncate('Hello', 10)).toBe('Hello'); });
  });

  describe('getInitials', () => {
    it('gets initials from name', () => { expect(getInitials('John Doe')).toBe('JD'); });
  });

  describe('capitalize', () => {
    it('capitalizes string', () => { expect(capitalize('hello')).toBe('Hello'); });
  });

  describe('slugify', () => {
    it('slugifies string', () => { expect(slugify('Hello World')).toBe('hello-world'); });
  });
});
