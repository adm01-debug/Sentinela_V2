import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIdle } from '../useIdle';
describe('useIdle', () => {
  it('should track idle state', () => {
    const { result } = renderHook(() => useIdle(5000));
    expect(result.current).toBe(false);
  });
});