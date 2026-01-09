import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useForceUpdate } from '../useForceUpdate';

describe('useForceUpdate', () => {
  it('should force re-render', () => {
    let renderCount = 0;
    const { result } = renderHook(() => { renderCount++; return useForceUpdate(); });
    expect(renderCount).toBe(1);
    act(() => { result.current(); });
    expect(renderCount).toBe(2);
  });
});