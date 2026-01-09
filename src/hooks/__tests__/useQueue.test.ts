import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useQueue } from '../useQueue';

describe('useQueue', () => {
  it('should initialize empty', () => {
    const { result } = renderHook(() => useQueue());
    expect(result.current.size).toBe(0);
  });

  it('should enqueue items', () => {
    const { result } = renderHook(() => useQueue());
    act(() => { result.current.enqueue(1); });
    expect(result.current.first).toBe(1);
  });

  it('should dequeue items', () => {
    const { result } = renderHook(() => useQueue([1, 2]));
    let item;
    act(() => { item = result.current.dequeue(); });
    expect(item).toBe(1);
    expect(result.current.first).toBe(2);
  });
});