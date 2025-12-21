import { useState, useEffect, useCallback } from 'react';

export function useEventSource(url: string) {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const es = new EventSource(url);
    es.onmessage = (e) => setData(JSON.parse(e.data));
    es.onerror = () => setError(new Error('EventSource failed'));
    return () => es.close();
  }, [url]);
  return { data, error };
}