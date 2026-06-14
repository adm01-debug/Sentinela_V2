import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// SPINNER
// ============================================================

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const spinnerSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export const Spinner = memo(function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', spinnerSizes[size], className)}
      aria-label="Carregando..."
    />
  );
});

// ============================================================
// PULSE DOT
// ============================================================

interface PulseDotsProps {
  count?: number;
  className?: string;
}

export const PulseDots = memo(function PulseDots({ count = 3, className }: PulseDotsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-primary animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
});

// ============================================================
// SHIMMER
// ============================================================

interface ShimmerProps {
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  style?: React.CSSProperties;
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export const Shimmer = memo(function Shimmer({ className, rounded = 'md', style }: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        roundedClasses[rounded],
        className
      )}
      style={style}
    >
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"
        style={{
          animation: 'shimmer 2s infinite',
        }}
      />
    </div>
  );
});

// ============================================================
// SKELETON VARIANTS
// ============================================================

interface SkeletonCardProps {
  variant?: 'stat' | 'chart' | 'list' | 'table';
  className?: string;
}

export const SkeletonCard = memo(function SkeletonCard({
  variant = 'stat',
  className,
}: SkeletonCardProps) {
  switch (variant) {
    case 'stat':
      return (
        <div className={cn('p-5 rounded-xl bg-card border space-y-3', className)}>
          <div className="flex justify-between items-start">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-10 w-10 rounded-xl" />
          </div>
          <Shimmer className="h-8 w-20" />
          <Shimmer className="h-3 w-32" />
        </div>
      );

    case 'chart':
      return (
        <div className={cn('p-6 rounded-xl bg-card border space-y-4', className)}>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Shimmer className="h-5 w-32" />
              <Shimmer className="h-3 w-48" />
            </div>
            <Shimmer className="h-9 w-24 rounded-md" />
          </div>
          <div className="flex items-end gap-2 h-48">
            {Array.from({ length: 7 }).map((_, i) => (
              <Shimmer
                key={i}
                className="flex-1"
                rounded="sm"
                style={{ height: `${30 + Math.random() * 70}%` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      );

    case 'list':
      return (
        <div className={cn('p-4 rounded-xl bg-card border space-y-3', className)}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Shimmer className="h-10 w-10 rounded-full" rounded="full" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-4 w-3/4" />
                <Shimmer className="h-3 w-1/2" />
              </div>
              <Shimmer className="h-6 w-16 rounded-full" rounded="full" />
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className={cn('rounded-xl bg-card border overflow-hidden', className)}>
          {/* Header */}
          <div className="flex gap-4 p-4 border-b bg-muted/30">
            {Array.from({ length: 5 }).map((_, i) => (
              <Shimmer key={i} className="h-4 flex-1" />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 p-4 border-b last:border-0">
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <Shimmer key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
});

// ============================================================
// LOADING OVERLAY
// ============================================================

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingOverlay = memo(function LoadingOverlay({
  message = 'Carregando...',
  fullScreen = false,
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm z-50',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
    >
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
});

// ============================================================
// PAGE LOADING
// ============================================================

interface PageLoadingProps {
  title?: string;
  className?: string;
}

export const PageLoading = memo(function PageLoading({
  title,
  className,
}: PageLoadingProps) {
  return (
    <div className={cn('p-6 md:p-8 space-y-6', className)}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-8 w-64" />
        <Shimmer className="h-4 w-48" />
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} variant="stat" />
        ))}
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard variant="chart" />
        <SkeletonCard variant="list" />
      </div>
    </div>
  );
});

// ============================================================
// INLINE LOADING
// ============================================================

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export const InlineLoading = memo(function InlineLoading({
  text = 'Carregando',
  className,
}: InlineLoadingProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-muted-foreground', className)}>
      <Spinner size="xs" />
      <span>{text}</span>
      <PulseDots count={3} />
    </span>
  );
});

// ============================================================
// BUTTON LOADING
// ============================================================

interface ButtonLoadingProps {
  children?: React.ReactNode;
  className?: string;
}

export const ButtonLoading = memo(function ButtonLoading({
  children = 'Processando...',
  className,
}: ButtonLoadingProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Spinner size="sm" />
      {children}
    </span>
  );
});
