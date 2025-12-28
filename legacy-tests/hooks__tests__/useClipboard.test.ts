import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useClipboard());
    
    await act(async () => {
      await result.current.copy('test');
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
    expect(result.current.copied).toBe(true);
  });

  it('should reset copied state', () => {
    const { result } = renderHook(() => useClipboard());
    
    act(() => {
      result.current.reset();
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
