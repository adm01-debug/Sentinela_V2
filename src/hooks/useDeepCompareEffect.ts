import { useEffect, useRef } from "react";

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => deepEqual(objA[key], objB[key]));
}

export function useDeepCompareEffect(effect: () => void | (() => void), deps: unknown[]) {
  const ref = useRef<unknown[]>(deps);

  if (!deepEqual(deps, ref.current)) {
    ref.current = deps;
  }

  useEffect(effect, [ref.current]);
}
