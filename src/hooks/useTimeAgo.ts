import { useState, useEffect, useMemo } from "react";

export function useTimeAgo(date: Date, interval = 60000) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), interval);
    return () => clearInterval(timer);
  }, [interval]);

  return useMemo(() => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (mins > 0) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    return "just now";
  }, [date]);
}
