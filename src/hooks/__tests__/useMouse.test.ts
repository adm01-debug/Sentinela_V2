import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMouse } from '../useMouse';

describe('useMouse', () => {
  it('should track mouse position', () => {
    const { result } = renderHook(() => useMouse());
    act(() => { document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 100 })); });
    expect(result.current.x).toBe(50);
    expect(result.current.y).toBe(100);
  });
});