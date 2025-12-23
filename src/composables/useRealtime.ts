import { useEffect, useRef, useState, useCallback } from 'react';

export function useRealtime<T>(channel: string, onMessage: (data: T) => void) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL + '/' + channel);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => onMessage(JSON.parse(e.data));
    wsRef.current = ws;
  }, [channel, onMessage]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { connected, send, disconnect, reconnect: connect };
}
