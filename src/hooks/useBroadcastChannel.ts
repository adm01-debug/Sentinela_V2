import { useState, useEffect, useCallback } from 'react';

export function useBroadcastChannel<T>(channelName: string) {
  const [message, setMessage] = useState<T | null>(null);
  const [channel] = useState(() => new BroadcastChannel(channelName));
  useEffect(() => { channel.onmessage = (e) => setMessage(e.data); return () => channel.close(); }, [channel]);
  const send = useCallback((data: T) => channel.postMessage(data), [channel]);
  return { message, send };
}