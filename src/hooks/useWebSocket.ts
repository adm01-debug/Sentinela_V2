import { useState, useCallback, useRef, useEffect } from 'react';

interface WebSocketConfig { url: string; reconnect?: boolean; reconnectInterval?: number; maxReconnectAttempts?: number; }
type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WSMessage {
  data: unknown;
  timestamp: Date;
}

export function useWebSocket(config: WebSocketConfig) {
  const [status, setStatus] = useState<WSStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setStatus('connecting');
    setError(null);
    const ws = new WebSocket(config.url);
    ws.onopen = () => { setStatus('connected'); reconnectAttempts.current = 0; };
    ws.onmessage = (event) => { try { setLastMessage({ data: JSON.parse(event.data), timestamp: new Date() }); } catch { setLastMessage({ data: event.data, timestamp: new Date() }); } };
    ws.onerror = () => setError(new Error('WebSocket error'));
    ws.onclose = () => {
      setStatus('disconnected');
      if (config.reconnect && reconnectAttempts.current < (config.maxReconnectAttempts || 5)) {
        reconnectAttempts.current++;
        setTimeout(connect, config.reconnectInterval || 3000);
      }
    };
    wsRef.current = ws;
  }, [config]);

  const disconnect = useCallback(() => { wsRef.current?.close(); wsRef.current = null; setStatus('disconnected'); }, []);
  const send = useCallback((data: unknown) => { if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data)); }, []);

  useEffect(() => { return () => { wsRef.current?.close(); }; }, []);

  return { connect, disconnect, send, status, lastMessage, error, isConnected: status === 'connected' };
}
export default useWebSocket;
