import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEventSource } from '../useEventSource';

describe('useEventSource', () => {
  it('should connect to event source', () => {
    global.EventSource = vi.fn(() => ({ addEventListener: vi.fn(), close: vi.fn() })) as any;
    const { result } = renderHook(() => useEventSource('http://test'));
    expect(result.current.readyState).toBeDefined();
  });
});