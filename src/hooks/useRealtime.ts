import { useState, useEffect, useRef, useCallback } from "react";

export function useRealtime<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url: string);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => setData(JSON.parse(e.data));

    return () => ws.close();
  }, [url]);

  const send = useCallback((message) => {
    wsRef.current?.send(JSON.stringify(message));
  }, []);

  return { data, connected, send };
}
