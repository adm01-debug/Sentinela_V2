import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useWebSocket } from '../useWebSocket';

describe('useWebSocket', () => {
  it('should connect to WebSocket', () => {
    const mockWs = { send: vi.fn(), close: vi.fn(), addEventListener: vi.fn() };
    global.WebSocket = vi.fn(() => mockWs) as any;
    const { result } = renderHook(() => useWebSocket('ws://test'));
    expect(result.current.readyState).toBeDefined();
  });

  it('should send messages', () => {
    const mockWs = { send: vi.fn(), close: vi.fn(), addEventListener: vi.fn(), readyState: 1 };
    global.WebSocket = vi.fn(() => mockWs) as any;
    const { result } = renderHook(() => useWebSocket('ws://test'));
    act(() => { result.current.send('hello'); });
    expect(mockWs.send).toHaveBeenCalledWith('hello');
  });
});