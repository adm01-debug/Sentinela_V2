import { useState, useCallback } from "react";

export function useNumber(initialValue = 0, options?: { min?: number; max?: number; step?: number }) {
  const { min = -Infinity, max = Infinity, step = 1 } = options || {};
  const [value, setValue] = useState(initialValue);

  const clamp = useCallback((v) => Math.min(max, Math.max(min, v)), [min, max]);

  const increment = useCallback(() => setValue(v => clamp(v + step)), [clamp, step]);
  const decrement = useCallback(() => setValue(v => clamp(v - step)), [clamp, step]);
  const set = useCallback((v) => setValue(clamp(v)), [clamp]);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return { value, increment, decrement, set, reset };
}
