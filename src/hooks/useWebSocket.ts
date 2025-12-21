import { useState, useEffect, useCallback, useRef } from 'react';
export function useWebSocket(url: string) {
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const ws = useRef<WebSocket | null>(null);
  useEffect(() => { ws.current = new WebSocket(url); ws.current.onopen = () => setStatus('open'); ws.current.onclose = () => setStatus('closed'); ws.current.onmessage = (e) => setLastMessage(JSON.parse(e.data)); return () => ws.current?.close(); }, [url]);
  const send = useCallback((data: unknown) => ws.current?.send(JSON.stringify(data)), []);
  return { lastMessage, status, send };
}