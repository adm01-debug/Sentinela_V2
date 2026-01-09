import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCopyToClipboard } from '../useCopyToClipboard';

describe('useCopyToClipboard', () => {
  it('should copy text', async () => {
    navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) } as any;
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => { await result.current.copy('test'); });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
  });
});