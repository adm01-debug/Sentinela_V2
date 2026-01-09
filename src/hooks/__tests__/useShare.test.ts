import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useShare } from '../useShare';

describe('useShare', () => {
  it('should check share support', () => {
    const { result } = renderHook(() => useShare());
    expect(result.current.isSupported).toBeDefined();
  });

  it('should share content', async () => {
    navigator.share = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useShare());
    await act(async () => { await result.current.share({ title: 'Test' }); });
    expect(navigator.share).toHaveBeenCalled();
  });
});