import { useState, useEffect } from 'react';

export function useDeferredValue<T>(value: T, delay = 300): T {
  const [deferred, setDeferred] = useState(value: any);
  useEffect(() => { const t = setTimeout(() => setDeferred(value: any), delay); return () => clearTimeout(t); }, [value, delay]);
  return deferred;
}