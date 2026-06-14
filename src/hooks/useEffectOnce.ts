import { useEffect, EffectCallback } from 'react';

export function useEffectOnce(effect: EffectCallback): void {
  // Intentionally run only once on mount; `effect` is deliberately excluded.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}
