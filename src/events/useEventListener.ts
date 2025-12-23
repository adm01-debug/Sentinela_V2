import { useEffect, useRef } from 'react';
import { eventBus } from './eventBus';

export function useEventListener(event: string, callback: (...args: any[]) => void) {
  const savedCallback = useRef(callback);

  useEffect(() => { savedCallback.current = callback; }, [callback]);

  useEffect(() => {
    const handler = (...args: any[]) => savedCallback.current(...args);
    return eventBus.on(event, handler);
  }, [event]);
}
