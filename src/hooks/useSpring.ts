import { useState, useCallback, useRef, useEffect } from "react";

export function useSpring(initialValue: number, config = { stiffness: 100, damping: 10 }) {
  const [value, setValue] = useState(initialValue);
  const targetRef = useRef(initialValue);
  const velocityRef = useRef(0);
  const rafRef = useRef<number>();

  const animate = useCallback(() => {
    const { stiffness, damping } = config;
    const displacement = targetRef.current - value;
    const spring = stiffness * displacement;
    const damper = damping * velocityRef.current;
    velocityRef.current += (spring - damper) / 60;
    setValue((v) => v + velocityRef.current / 60);
    
    if (Math.abs(displacement) > 0.01 || Math.abs(velocityRef.current) > 0.01) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [value, config]);

  const set = useCallback((target: number) => {
    targetRef.current = target;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return [value, set] as const;
}
