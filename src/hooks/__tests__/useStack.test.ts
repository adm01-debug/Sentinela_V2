import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStack } from '../useStack';

describe('useStack', () => {
  it('should push items', () => {
    const { result } = renderHook(() => useStack());
    act(() => { result.current.push(1); });
    expect(result.current.peek).toBe(1);
  });

  it('should pop items', () => {
    const { result } = renderHook(() => useStack([1, 2]));
    let item;
    act(() => { item = result.current.pop(); });
    expect(item).toBe(2);
  });
});