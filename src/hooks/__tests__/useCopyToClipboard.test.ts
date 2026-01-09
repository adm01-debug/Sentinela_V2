import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCopyToClipboard } from '../useCopyToClipboard';

describe('useCopyToClipboard', () => {
  it('should copy text to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => { await result.current.copy('test'); });
    expect(result.current.copied).toBe(true);
  });
});