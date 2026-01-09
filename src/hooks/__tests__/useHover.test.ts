import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHover } from '../useHover';

describe('useHover', () => {
  it('should track hover state', () => {
    const element = document.createElement('div');
    const { result } = renderHook(() => useHover({ current: element }));
    expect(result.current).toBe(false);
    act(() => { element.dispatchEvent(new MouseEvent('mouseenter')); });
    expect(result.current).toBe(true);
    act(() => { element.dispatchEvent(new MouseEvent('mouseleave')); });
    expect(result.current).toBe(false);
  });
});