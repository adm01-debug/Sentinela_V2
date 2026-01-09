import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNumberFormat } from '../useNumberFormat';

describe('useNumberFormat', () => {
  it('should format number', () => {
    const { result } = renderHook(() => useNumberFormat(1234.56, { style: 'currency', currency: 'USD' }));
    expect(result.current).toContain('1,234.56');
  });
});