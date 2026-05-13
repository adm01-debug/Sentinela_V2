import { useState, useEffect, useCallback, useRef } from "react";

export function useSSE<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    sourceRef.current = new EventSource(url);
    
    sourceRef.current.onopen = () => setConnected(true);
    sourceRef.current.onerror = () => {
      setError(new Error("SSE connection error"));
      setConnected(false);
    };
    sourceRef.current.onmessage = (e: any) => {
      setData(JSON.parse(e.data));
    };
  }, [url]);

  const disconnect = useCallback(() => {
    sourceRef.current?.close();
    setConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { data, error, connected, disconnect };
}
