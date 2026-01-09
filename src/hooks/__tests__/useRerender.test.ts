import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRerender } from '../useRerender';

describe('useRerender', () => {
  it('should trigger rerender', () => {
    let count = 0;
    const { result } = renderHook(() => { count++; return useRerender(); });
    act(() => { result.current(); });
    expect(count).toBe(2);
  });
});