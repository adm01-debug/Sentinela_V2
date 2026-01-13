import { useEffect, useRef } from "react";

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => deepEqual((a as any)[key], (b as any)[key]));
}

export function useDeepCompareEffect(effect: () => void | (() => void), deps: unknown[]) {
  const ref = useRef<unknown[]>(deps);

  if (!deepEqual(deps, ref.current)) {
    ref.current = deps;
  }

  useEffect(effect, [ref.current]);
}
