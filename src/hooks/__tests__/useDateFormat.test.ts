import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDateFormat } from '../useDateFormat';

describe('useDateFormat', () => {
  it('should format date', () => {
    const { result } = renderHook(() => useDateFormat(new Date('2024-01-01'), 'YYYY-MM-DD'));
    expect(result.current).toBe('2024-01-01');
  });
});