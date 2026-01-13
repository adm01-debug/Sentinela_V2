import { useState, useEffect } from "react";

export function useTick(interval = 1000) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), interval);
    return () => clearInterval(timer);
  }, [interval]);

  return tick;
}
