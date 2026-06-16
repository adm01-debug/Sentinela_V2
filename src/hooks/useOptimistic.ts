import { useState, useCallback } from "react";

export function useOptimistic<T>(
  initialValue: T,
  updateFn: (current: T, optimistic: T) => Promise<T>
) {
  const [value, setValue] = useState(initialValue);
  const [optimisticValue, setOptimisticValue] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);

  const update = useCallback(
    async (newValue: T) => {
      setOptimisticValue(newValue);
      setIsPending(true);

      try {
        const result = await updateFn(value, newValue);
        setValue(result);
        setOptimisticValue(result);
      } catch {
        setOptimisticValue(value);
      } finally {
        setIsPending(false);
      }
    },
    [value, updateFn]
  );

  return { value: optimisticValue, isPending, update };
}
