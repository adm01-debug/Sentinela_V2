import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCustomDebugValue } from '../useDebugValue';

describe('useDebugValue', () => {
  it('should set debug value', () => {
    const { result } = renderHook(() => useCustomDebugValue({ test: true }));
    expect(result.current).toEqual({ test: true });
  });
});