import { useState, useCallback } from 'react';
export function useQueue<T>(initial: T[] = []) {
  const [queue, setQueue] = useState(initial);
  const enqueue = useCallback((item: T) => setQueue(q => [...q, item]), []);
  const dequeue = useCallback(() => { let first: T | undefined; setQueue(q => { [first, ...q] = q; return q; }); return first; }, []);
  const peek = queue[0];
  return { queue, enqueue, dequeue, peek, size: queue.length, clear: () => setQueue([]) };
}