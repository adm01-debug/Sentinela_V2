import { useState, useCallback, RefObject } from 'react';
export function useFullscreen(ref: RefObject<HTMLElement>) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const enter = useCallback(() => { ref.current?.requestFullscreen(); setIsFullscreen(true); }, [ref]);
  const exit = useCallback(() => { document.exitFullscreen(); setIsFullscreen(false); }, []);
  return { isFullscreen, enter, exit, toggle: () => isFullscreen ? exit() : enter() };
}