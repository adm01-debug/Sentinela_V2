import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEventSource } from '../useEventSource';

describe('useEventSource', () => {
  it('should create event source', () => {
    const mockEs = { close: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
    global.EventSource = vi.fn(() => mockEs) as any;
    renderHook(() => useEventSource('http://test/events'));
    expect(global.EventSource).toHaveBeenCalled();
  });
});