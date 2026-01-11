import { describe, it, expect } from 'vitest';
import { formatNumber, formatCurrency, formatBytes, percentage } from '../number';
describe('number', () => {
  it('formats number', () => { expect(formatNumber(1000)).toBe('1,000'); });
  it('formats currency', () => { expect(formatCurrency(100, 'USD')).toContain('100'); });
  it('formats bytes', () => { expect(formatBytes(1024)).toBe('1.0 KB'); });
  it('calculates percentage', () => { expect(percentage(25, 100)).toBe(25); });
});