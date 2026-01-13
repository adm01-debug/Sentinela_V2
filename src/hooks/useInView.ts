import { useState, useRef, useEffect } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useInView(options: UseInViewOptions = {}) {
  const { threshold = 0, rootMargin = "0px", triggerOnce = false } = options;
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (triggerOnce && triggered.current)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isInView = entry.isIntersecting;
        setInView(isInView);
        if (isInView && triggerOnce) triggered.current = true;
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, inView };
}
