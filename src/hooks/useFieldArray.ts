import { useState, useCallback } from 'react';
export function useFieldArray<T>(initial: T[] = []) {
  const [fields, setFields] = useState(initial);
  const append = useCallback((item: T) => setFields(f => [...f, item]), []);
  const remove = useCallback((i: number) => setFields(f => f.filter((_, idx) => idx !== i)), []);
  return { fields, append, remove, replace: setFields };
}