import { describe, it, expect } from 'vitest';
import { formatDate, isValidDate } from '../date';
describe('date', () => {
  it('formats date', () => { expect(formatDate('2026-01-15', 'yyyy-MM-dd')).toBe('2026-01-15'); });
  it('validates date', () => { expect(isValidDate('2026-01-15')).toBe(true); expect(isValidDate('invalid')).toBe(false); });
});