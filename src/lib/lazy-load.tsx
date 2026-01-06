import * as React from 'react';
import { Suspense, lazy, ComponentType, useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps { fallback?: React.ReactNode; threshold?: number; rootMargin?: string; }

export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadProps = {}
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    const { fallback = <Skeleton className="h-32 w-full" />, threshold = 0, rootMargin = '100px' } = options;
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
        { threshold, rootMargin }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, []);

    if (!isVisible) return <div ref={ref}>{fallback}</div>;

    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export function LazyImage({ src, alt, className, placeholder, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { placeholder?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && imgRef.current) {
        imgRef.current.src = src || '';
        observer.disconnect();
      }
    }, { rootMargin: '50px' });
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className="relative">
      {!loaded && !error && <Skeleton className={className} />}
      <img ref={imgRef} alt={alt} className={`${className} ${!loaded ? 'opacity-0' : 'opacity-100'} transition-opacity`} onLoad={() => setLoaded(true)} onError={() => setError(true)} {...props} />
      {error && <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>Failed to load</div>}
    </div>
  );
}

export default lazyLoad;
