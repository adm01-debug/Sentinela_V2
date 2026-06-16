import { useState, useEffect } from "react";
export function useIdle(timeout = 60000) {
  const [isIdle, setIsIdle] = useState(false);
  const [lastActive, setLastActive] = useState(Date.now());
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleActivity = () => {
      setIsIdle(false);
      setLastActive(Date.now());
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsIdle(true), timeout);
    };
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((e) => document.addEventListener(e, handleActivity));
    timeoutId = setTimeout(() => setIsIdle(true), timeout);
    return () => {
      events.forEach((e) => document.removeEventListener(e, handleActivity));
      clearTimeout(timeoutId);
    };
  }, [timeout]);
  return { isIdle, lastActive, idleTime: isIdle ? Date.now() - lastActive : 0 };
}
export default useIdle;
