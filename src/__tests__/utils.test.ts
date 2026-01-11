import { describe, it, expect } from 'vitest';
import { cn } from '../utils/cn';
import { formatNumber, formatCurrency } from '../utils/number';

describe('cn', () => { it('merges classes', () => { expect(cn('p-4', 'text-red-500')).toBe('p-4 text-red-500'); }); it('handles conditionals', () => { expect(cn('base', false && 'hidden')).toBe('base'); }); });

describe('formatNumber', () => { it('formats with commas', () => { expect(formatNumber(1000)).toBe('1,000'); }); });