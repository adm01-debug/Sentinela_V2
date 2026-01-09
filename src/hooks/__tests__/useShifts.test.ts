import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useShifts } from '../useShifts';

describe('useShifts', () => {
  it('should manage shifts', () => {
    const { result } = renderHook(() => useShifts());
    expect(result.current.shifts).toBeDefined();
    expect(typeof result.current.assign).toBe('function');
  });
});