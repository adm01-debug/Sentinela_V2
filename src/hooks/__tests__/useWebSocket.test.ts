import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useWebSocket } from '../useWebSocket';

describe('useWebSocket', () => {
  it('should connect to websocket', () => {
    const mockWS = { send: vi.fn(), close: vi.fn(), addEventListener: vi.fn() };
    global.WebSocket = vi.fn(() => mockWS) as any;
    const { result } = renderHook(() => useWebSocket('ws://test'));
    expect(result.current.readyState).toBeDefined();
  });

  it('should send message', () => {
    const mockWS = { send: vi.fn(), close: vi.fn(), addEventListener: vi.fn(), readyState: 1 };
    global.WebSocket = vi.fn(() => mockWS) as any;
    const { result } = renderHook(() => useWebSocket('ws://test'));
    act(() => { result.current.send('test'); });
  });
});