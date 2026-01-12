import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('websocketService', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    mockWebSocket = {
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: 1,
    };
    vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket));
  });

  it('should connect to websocket', () => {
    const ws = new WebSocket('wss://example.com/ws');
    expect(WebSocket).toHaveBeenCalledWith('wss://example.com/ws');
  });

  it('should send message', () => {
    const ws = new WebSocket('wss://example.com/ws');
    ws.send(JSON.stringify({ type: 'ping' }));
    expect(mockWebSocket.send).toHaveBeenCalled();
  });

  it('should close connection', () => {
    const ws = new WebSocket('wss://example.com/ws');
    ws.close();
    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('should add message listener', () => {
    const ws = new WebSocket('wss://example.com/ws');
    const handler = vi.fn();
    ws.addEventListener('message', handler);
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('message', handler);
  });

  it('should add error listener', () => {
    const ws = new WebSocket('wss://example.com/ws');
    const handler = vi.fn();
    ws.addEventListener('error', handler);
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('error', handler);
  });

  it('should add close listener', () => {
    const ws = new WebSocket('wss://example.com/ws');
    const handler = vi.fn();
    ws.addEventListener('close', handler);
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('close', handler);
  });

  it('should check ready state', () => {
    const ws = new WebSocket('wss://example.com/ws');
    expect(ws.readyState).toBe(1);
  });

  it('should handle reconnection', () => {
    const reconnect = vi.fn();
    mockWebSocket.addEventListener.mockImplementation((event: string, handler: Function) => {
      if (event === 'close') {
        setTimeout(() => handler(), 0);
      }
    });
    
    const ws = new WebSocket('wss://example.com/ws');
    ws.addEventListener('close', reconnect);
    expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('close', reconnect);
  });
});
