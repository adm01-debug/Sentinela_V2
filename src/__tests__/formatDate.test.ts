import { describe, it, expect } from 'vitest';
import { formatDate, isValidDate, daysDiff } from '../utils/date';

describe('date utils', () => {
  it('formats date', () => { expect(formatDate('2026-01-15', 'yyyy-MM-dd')).toBe('2026-01-15'); });
  it('validates date', () => { expect(isValidDate('2026-01-15')).toBe(true); expect(isValidDate('invalid')).toBe(false); });
  it('calculates days diff', () => { expect(daysDiff('2026-01-01', '2026-01-10')).toBe(9); });
});