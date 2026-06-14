import { useState, useCallback, useEffect } from "react";

export function useRealtimeSync<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(key);
    channel.onmessage = (e: MessageEvent<T>) => {
      setValue(e.data);
      setLastSync(new Date());
    };
    return () => channel.close();
  }, [key]);

  const sync = useCallback((newValue: T) => {
    setValue(newValue);
    const channel = new BroadcastChannel(key);
    channel.postMessage(newValue);
    channel.close();
    setLastSync(new Date());
  }, [key]);

  return { value, sync, lastSync };
}
