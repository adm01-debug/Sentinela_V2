import { useState, useCallback, useEffect } from "react";

interface SSEConfig {
  url: string;
  withCredentials?: boolean;
}
type SSEStatus = "connecting" | "connected" | "disconnected" | "error";

export function useServerSentEvents(config: SSEConfig) {
  const [status, setStatus] = useState<SSEStatus>("disconnected");
  const [lastEvent, setLastEvent] = useState<{
    data: unknown;
    timestamp: Date;
    id?: string;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSource) eventSource.close();
    setStatus("connecting");
    setError(null);
    const es = new EventSource(config.url, { withCredentials: config.withCredentials });
    es.onopen = () => setStatus("connected");
    es.onmessage = (event) => {
      try {
        setLastEvent({
          data: JSON.parse(event.data),
          timestamp: new Date(),
          id: event.lastEventId,
        });
      } catch {
        setLastEvent({ data: event.data, timestamp: new Date() });
      }
    };
    es.onerror = () => {
      setStatus("error");
      setError(new Error("SSE connection error"));
    };
    setEventSource(es);
    return () => es.close();
  }, [config.url, config.withCredentials, eventSource]);

  const disconnect = useCallback(() => {
    eventSource?.close();
    setEventSource(null);
    setStatus("disconnected");
  }, [eventSource]);

  useEffect(() => {
    return () => {
      eventSource?.close();
    };
  }, [eventSource]);

  return { connect, disconnect, status, lastEvent, error, isConnected: status === "connected" };
}
export default useServerSentEvents;
