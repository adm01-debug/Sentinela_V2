import { useEffect, useRef } from 'react';
export function useUpdateEffect(effect: () => void, deps: React.DependencyList) {
  const isFirst = useRef(true);
  useEffect(() => { if (isFirst.current) { isFirst.current = false; return; } return effect(); }, deps);
}