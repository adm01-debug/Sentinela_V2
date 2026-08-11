import { useRef, useCallback } from 'react';
export function useFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const setFocus = useCallback(() => ref.current?.focus(), []);
  return { ref, setFocus };
}