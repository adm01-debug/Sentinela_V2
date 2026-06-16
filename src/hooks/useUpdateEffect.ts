import { useEffect, useRef } from "react";
export function useUpdateEffect(effect: () => void, deps: React.DependencyList) {
  const isFirst = useRef(true);
  // Generic utility hook: deps are intentionally forwarded from the caller, and
  // `effect` is intentionally not tracked so it always runs with the latest closure.
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
