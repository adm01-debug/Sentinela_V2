import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useScrollTo } from '../useScrollTo';

describe('useScrollTo', () => {
  it('should scroll to position', () => {
    window.scrollTo = vi.fn();
    const { result } = renderHook(() => useScrollTo());
    act(() => { result.current.scrollTo(0, 100); });
    expect(window.scrollTo).toHaveBeenCalled();
  });
});