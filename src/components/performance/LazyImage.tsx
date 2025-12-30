import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  blurDataUrl?: string;
  aspectRatio?: number;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

function LazyImageComponent({
  src,
  alt,
  placeholderSrc,
  blurDataUrl,
  aspectRatio,
  fallback,
  className,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const containerStyle: React.CSSProperties = aspectRatio
    ? { paddingBottom: `${(1 / aspectRatio) * 100}%` }
    : {};

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', aspectRatio && 'w-full h-0')}
      style={containerStyle}
    >
      {/* Blur placeholder */}
      {blurDataUrl && !isLoaded && (
        <img
          src={blurDataUrl}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover blur-xl scale-110',
            aspectRatio ? 'absolute' : 'relative'
          )}
          aria-hidden="true"
        />
      )}

      {/* Skeleton placeholder */}
      {!blurDataUrl && !isLoaded && !hasError && (
        <Skeleton
          className={cn(
            'w-full h-full',
            aspectRatio ? 'absolute inset-0' : 'aspect-square'
          )}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            aspectRatio ? 'absolute inset-0 w-full h-full object-cover' : '',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && !fallback && (
        <div
          className={cn(
            'flex items-center justify-center bg-muted text-muted-foreground',
            aspectRatio ? 'absolute inset-0' : 'aspect-square w-full'
          )}
        >
          <span className="text-sm">Erro ao carregar imagem</span>
        </div>
      )}
    </div>
  );
}

export const LazyImage = memo(LazyImageComponent);

// Avatar with lazy loading
interface LazyAvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function LazyAvatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
}: LazyAvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const initials = fallback || alt.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-muted flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {src && !hasError ? (
        <>
          {!isLoaded && (
            <span className="font-medium text-muted-foreground">{initials}</span>
          )}
          <img
            src={src}
            alt={alt}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-200',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            loading="lazy"
          />
        </>
      ) : (
        <span className="font-medium text-muted-foreground">{initials}</span>
      )}
    </div>
  );
}

// Preload utility
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Preload multiple images
export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

export default LazyImage;
