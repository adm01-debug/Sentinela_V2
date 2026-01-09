import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useContextMenu } from '../useContextMenu';

describe('useContextMenu', () => {
  it('should show context menu', () => {
    const { result } = renderHook(() => useContextMenu());
    act(() => { result.current.show({ x: 100, y: 100 }); });
    expect(result.current.isVisible).toBe(true);
  });

  it('should hide context menu', () => {
    const { result } = renderHook(() => useContextMenu());
    act(() => { result.current.show({ x: 100, y: 100 }); result.current.hide(); });
    expect(result.current.isVisible).toBe(false);
  });
});