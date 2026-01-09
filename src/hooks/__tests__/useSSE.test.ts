import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSSE } from '../useSSE';

describe('useSSE', () => {
  it('should connect to SSE', () => {
    const mockEs = { close: vi.fn(), addEventListener: vi.fn() };
    global.EventSource = vi.fn(() => mockEs) as any;
    const { result } = renderHook(() => useSSE('/events'));
    expect(result.current.connected).toBeDefined();
  });
});