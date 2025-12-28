import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useThrottle } from '../useThrottle';

describe('useThrottle', () => {
  it('works', () => {
    const { result } = renderHook(() => useThrottle());
    expect(result.current).toBeDefined();
  });
});