import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScrollLock } from '../useScrollLock';

describe('useScrollLock', () => {
  it('should lock scroll', () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => { result.current.lock(); });
    expect(document.body.style.overflow).toBe('hidden');
    act(() => { result.current.unlock(); });
  });
});