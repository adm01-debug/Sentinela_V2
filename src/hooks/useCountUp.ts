import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
}

export function useCountUp({
  end,
  duration = 800,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = '',
}: UseCountUpOptions) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    function animate() {
      const startTime = performance.now();

      function tick(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(eased * end);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setValue(end);
        }
      }

      requestAnimationFrame(tick);
    }

    return () => observer.disconnect();
  }, [end, duration]);

  const formatted = `${prefix}${value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, separator || ',')}${suffix}`;

  return { ref, value, formatted };
}
