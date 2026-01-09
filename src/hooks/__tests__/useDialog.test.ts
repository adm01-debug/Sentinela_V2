import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDialog } from '../useDialog';

describe('useDialog', () => {
  it('should show dialog', () => {
    const { result } = renderHook(() => useDialog());
    act(() => { result.current.show(); });
    expect(result.current.visible).toBe(true);
  });

  it('should hide dialog', () => {
    const { result } = renderHook(() => useDialog());
    act(() => { result.current.show(); result.current.hide(); });
    expect(result.current.visible).toBe(false);
  });
});