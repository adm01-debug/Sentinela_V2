import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useForceUpdate } from '../useForceUpdate';

describe('useForceUpdate', () => {
  it('should force update', () => {
    let count = 0;
    const { result } = renderHook(() => { count++; return useForceUpdate(); });
    expect(count).toBe(1);
    act(() => { result.current(); });
    expect(count).toBe(2);
  });
});