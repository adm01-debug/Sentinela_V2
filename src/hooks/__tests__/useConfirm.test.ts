import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useConfirm } from '../useConfirm';

describe('useConfirm', () => {
  it('should show confirmation', () => {
    const { result } = renderHook(() => useConfirm());
    act(() => { result.current.confirm('Are you sure?'); });
    expect(result.current.isConfirming).toBe(true);
    expect(result.current.message).toBe('Are you sure?');
  });

  it('should handle confirm', async () => {
    const { result } = renderHook(() => useConfirm());
    let confirmed: boolean | undefined;
    act(() => { result.current.confirm('Sure?').then(r => { confirmed = r; }); });
    act(() => { result.current.onConfirm(); });
    expect(confirmed).toBe(true);
  });
});