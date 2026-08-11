import { useState, useCallback } from "react";

export function useRerender() {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick(t => t + 1), []);
  return rerender;
}
