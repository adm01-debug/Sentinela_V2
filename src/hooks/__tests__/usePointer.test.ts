import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePointer } from '../usePointer';

describe('usePointer', () => {
  it('should track pointer position', () => {
    const { result } = renderHook(() => usePointer());
    act(() => { document.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 200 })); });
    expect(result.current.x).toBe(100);
    expect(result.current.y).toBe(200);
  });
});