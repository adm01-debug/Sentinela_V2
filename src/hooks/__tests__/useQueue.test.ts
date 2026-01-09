import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useQueue } from '../useQueue';

describe('useQueue', () => {
  it('should enqueue and dequeue', () => {
    const { result } = renderHook(() => useQueue<number>());
    act(() => { result.current.enqueue(1); result.current.enqueue(2); });
    expect(result.current.first).toBe(1);
    act(() => { result.current.dequeue(); });
    expect(result.current.first).toBe(2);
  });
});