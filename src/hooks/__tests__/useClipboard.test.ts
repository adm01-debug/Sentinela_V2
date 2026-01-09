import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClipboard } from '../useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => { await result.current.copy('test'); });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
  });

  it('should track copied state', async () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.copied).toBe(false);
    await act(async () => { await result.current.copy('test'); });
    expect(result.current.copied).toBe(true);
  });
});