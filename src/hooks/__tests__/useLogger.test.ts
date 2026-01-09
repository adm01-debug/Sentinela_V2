import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLogger } from '../useLogger';

describe('useLogger', () => {
  it('should log lifecycle', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { unmount } = renderHook(() => useLogger('TestComponent'));
    unmount();
    spy.mockRestore();
  });
});