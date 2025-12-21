import { useState, useCallback } from 'react';
export function useTransition() {
  const [isPending, setIsPending] = useState(false);
  const startTransition = useCallback((fn: () => void) => { setIsPending(true); Promise.resolve().then(fn).finally(() => setIsPending(false)); }, []);
  return { isPending, startTransition };
}