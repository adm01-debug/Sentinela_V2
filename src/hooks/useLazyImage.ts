import { useState, useRef, useEffect } from "react";

export function useLazyImage(src: string, placeholder?: string) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || "");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const img = new Image();
        img.onload = () => {
          setCurrentSrc(src);
          setLoaded(true);
        };
        img.src = src;
        observer.disconnect();
      }
    });

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return { imgRef, currentSrc, loaded };
}
