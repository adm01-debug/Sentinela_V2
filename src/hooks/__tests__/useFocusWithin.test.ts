import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFocusWithin } from '../useFocusWithin';

describe('useFocusWithin', () => {
  it('should track focus within', () => {
    const element = document.createElement('div');
    const input = document.createElement('input');
    element.appendChild(input);
    document.body.appendChild(element);
    const { result } = renderHook(() => useFocusWithin({ current: element }));
    act(() => { input.focus(); });
    document.body.removeChild(element);
  });
});