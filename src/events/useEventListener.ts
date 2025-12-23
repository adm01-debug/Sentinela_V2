import { useEffect, useRef } from 'react';
import { eventBus } from './eventBus';

export function useEventListener<T>(event: string, callback: (data: T) => void): void {
  const savedCallback = useRef(callback);

  useEffect(() => { savedCallback.current = callback; }, [callback]);

  useEffect(() => {
    const handler = (data: T) => savedCallback.current(data);
    const unsubscribe = eventBus.on(event, handler);
    return unsubscribe;
  }, [event]);
}
