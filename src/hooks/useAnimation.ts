import { useState, useCallback, useRef } from 'react';

export function useAnimation(duration = 300) {
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const animate = useCallback(() => {
    setIsAnimating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsAnimating(false), duration);
  }, [duration]);
  return { isAnimating, animate };
}