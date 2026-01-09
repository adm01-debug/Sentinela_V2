import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFocus } from '../useFocus';

describe('useFocus', () => {
  it('should track focus state', () => {
    const element = document.createElement('input');
    document.body.appendChild(element);
    const { result } = renderHook(() => useFocus({ current: element }));
    expect(result.current).toBe(false);
    act(() => { element.focus(); });
    expect(result.current).toBe(true);
    act(() => { element.blur(); });
    expect(result.current).toBe(false);
    document.body.removeChild(element);
  });
});