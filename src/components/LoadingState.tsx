import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================
// SPINNER LOADING
// ============================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

function SpinnerComponent({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)} />
  );
}

export const Spinner = memo(SpinnerComponent);

// ============================================================
// FULL PAGE LOADING
// ============================================================

interface FullPageLoadingProps {
  message?: string;
}

function FullPageLoadingComponent({ message = 'Carregando...' }: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <Spinner size="xl" />
      <p className="mt-4 text-lg text-muted-foreground">{message}</p>
    </div>
  );
}

export const FullPageLoading = memo(FullPageLoadingComponent);

// ============================================================
// INLINE LOADING
// ============================================================

interface InlineLoadingProps {
  message?: string;
  className?: string;
}

function InlineLoadingComponent({ message, className }: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
      <Spinner size="sm" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}

export const InlineLoading = memo(InlineLoadingComponent);

// ============================================================
// CARD LOADING
// ============================================================

interface CardLoadingProps {
  className?: string;
}

function CardLoadingComponent({ className }: CardLoadingProps) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <Spinner size="lg" />
    </div>
  );
}

export const CardLoading = memo(CardLoadingComponent);

// ============================================================
// TABLE LOADING
// ============================================================

interface TableLoadingProps {
  rows?: number;
  columns?: number;
}

function TableLoadingComponent({ rows = 5, columns = 5 }: TableLoadingProps) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export const TableLoading = memo(TableLoadingComponent);

// ============================================================
// STATS CARDS LOADING
// ============================================================

interface StatsCardsLoadingProps {
  count?: number;
}

function StatsCardsLoadingComponent({ count = 4 }: StatsCardsLoadingProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export const StatsCardsLoading = memo(StatsCardsLoadingComponent);

// ============================================================
// LIST LOADING
// ============================================================

interface ListLoadingProps {
  items?: number;
  showAvatar?: boolean;
}

function ListLoadingComponent({ items = 5, showAvatar = true }: ListLoadingProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export const ListLoading = memo(ListLoadingComponent);

// ============================================================
// CHART LOADING
// ============================================================

function ChartLoadingComponent() {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Carregando gráfico...</p>
      </div>
    </div>
  );
}

export const ChartLoading = memo(ChartLoadingComponent);

// ============================================================
// CONDITIONAL LOADING WRAPPER
// ============================================================

interface LoadingStateProps {
  isLoading: boolean;
  loadingComponent?: React.ReactNode;
  children: React.ReactNode;
}

function LoadingStateComponent({ isLoading, loadingComponent, children }: LoadingStateProps) {
  if (isLoading) {
    return <>{loadingComponent || <CardLoading />}</>;
  }
  return <>{children}</>;
}

export const LoadingState = memo(LoadingStateComponent);
