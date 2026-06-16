import { useState, useCallback, useRef } from "react";
export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const enter = useCallback(async () => {
    if (ref.current?.requestFullscreen) {
      await ref.current.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);
  const exit = useCallback(async () => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  const toggle = useCallback(() => (isFullscreen ? exit() : enter()), [isFullscreen, enter, exit]);
  return { ref, isFullscreen, enter, exit, toggle };
}
export default useFullscreen;
