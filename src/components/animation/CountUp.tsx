import { useState, useEffect, useRef } from 'react';

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({ end, start = 0, duration = 2000, decimals = 0, prefix = '', suffix = '', className }: CountUpProps) {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTime = useRef<number>();

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      countRef.current = start + (end - start) * eased;
      setCount(countRef.current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return () => { startTime.current = undefined; };
  }, [end, start, duration]);

  return <span className={className}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}
