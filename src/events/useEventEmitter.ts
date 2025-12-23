import { useCallback } from 'react';
import { eventBus } from './eventBus';

export function useEventEmitter() {
  const emit = useCallback((event: string, ...args: any[]) => {
    eventBus.emit(event, ...args);
  }, []);

  return { emit };
}
