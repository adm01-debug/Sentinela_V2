import { describe, it, expect } from 'vitest';
import { getContrastRatio, meetsWCAGAA, meetsWCAGAAA, KEY_CODES } from '../accessibility';

describe('accessibility utilities', () => {
  it('should calculate contrast ratio', () => {
    const ratio = getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('should check WCAG AA compliance', () => {
    expect(meetsWCAGAA(4.5)).toBe(true);
    expect(meetsWCAGAA(3)).toBe(false);
    expect(meetsWCAGAA(3, true)).toBe(true);
  });

  it('should check WCAG AAA compliance', () => {
    expect(meetsWCAGAAA(7)).toBe(true);
    expect(meetsWCAGAAA(4.5)).toBe(false);
    expect(meetsWCAGAAA(4.5, true)).toBe(true);
  });

  it('should have correct key codes', () => {
    expect(KEY_CODES.ENTER).toBe('Enter');
    expect(KEY_CODES.ESCAPE).toBe('Escape');
    expect(KEY_CODES.TAB).toBe('Tab');
  });
});
