import { useState, useEffect } from "react";

export function useClock(updateInterval = 1000) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), updateInterval);
    return () => clearInterval(timer);
  }, [updateInterval]);

  return {
    time,
    hours: time.getHours(),
    minutes: time.getMinutes(),
    seconds: time.getSeconds(),
    formatted: time.toLocaleTimeString()
  };
}
