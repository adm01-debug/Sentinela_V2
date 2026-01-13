import { useState, useEffect, useRef } from "react";

type Direction = "up" | "down" | null;

export function useScrollDirection(threshold = 10) {
  const [direction, setDirection] = useState<Direction>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handler = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;
      
      if (Math.abs(diff) > threshold) {
        setDirection(diff > 0 ? "down" : "up");
        lastScrollY.current = currentY;
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);

  return direction;
}
