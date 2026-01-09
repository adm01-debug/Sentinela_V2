import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useQueue } from '../useQueue';

describe('useQueue', () => {
  it('should add to queue', () => {
    const { result } = renderHook(() => useQueue());
    act(() => { result.current.add('item'); });
    expect(result.current.first).toBe('item');
  });

  it('should remove from queue (FIFO)', () => {
    const { result } = renderHook(() => useQueue(['a', 'b']));
    act(() => { result.current.remove(); });
    expect(result.current.first).toBe('b');
  });

  it('should track size', () => {
    const { result } = renderHook(() => useQueue(['a', 'b', 'c']));
    expect(result.current.size).toBe(3);
  });
});