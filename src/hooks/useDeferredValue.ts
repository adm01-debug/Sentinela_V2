import { useState, useEffect } from 'react';

export function useDeferredValue<T>(value: T, delay = 300): T {
  const [deferred, setDeferred] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDeferred(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return deferred;
}