import { useCallback } from 'react';
import { eventBus } from './eventBus';

export function useEventEmitter() {
  const emit = useCallback(<T>(event: string, data?: T) => {
    eventBus.emit(event, data);
  }, []);

  return { emit };
}
