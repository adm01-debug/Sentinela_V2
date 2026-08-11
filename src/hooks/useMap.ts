import { useState, useCallback } from 'react';
export function useMap<K, V>(initial?: Map<K, V>) {
  const [map, setMap] = useState(new Map(initial));
  const set = useCallback((k: K, v: V) => setMap(m => new Map(m).set(k, v)), []);
  const remove = useCallback((k: K) => setMap(m => { const n = new Map(m); n.delete(k); return n; }), []);
  const clear = useCallback(() => setMap(new Map()), []);
  return { map, set, remove, clear, get: (k: K) => map.get(k) };
}