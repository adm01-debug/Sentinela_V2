// ============================================================
// LOAD MORE BUTTON COMPONENT
// Botão e trigger para carregar mais itens (infinite scroll manual)
// ============================================================

import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  loadedCount?: number;
  totalCount?: number;
  variant?: 'button' | 'link' | 'minimal';
  className?: string;
  children?: React.ReactNode;
}

// ============================================================
// COMPONENT
// ============================================================

export const LoadMoreButton = forwardRef<HTMLButtonElement, LoadMoreButtonProps>(
  (
    {
      onClick,
      isLoading = false,
      hasMore = true,
      loadedCount,
      totalCount,
      variant = 'button',
      className,
      children,
    },
    ref
  ) => {
    if (!hasMore) {
      return (
        <div className={cn('text-center py-4 text-sm text-muted-foreground', className)}>
          {loadedCount && totalCount
            ? `Mostrando todos os ${totalCount} registros`
            : 'Todos os registros carregados'}
        </div>
      );
    }

    const remaining = totalCount && loadedCount ? totalCount - loadedCount : undefined;

    // ============================================================
    // BUTTON VARIANT
    // ============================================================

    if (variant === 'button') {
      return (
        <div className={cn('flex justify-center py-4', className)}>
          <Button
            ref={ref}
            variant="outline"
            onClick={onClick}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                {children ?? (
                  <>
                    Carregar mais
                    {remaining && ` (${remaining} restantes)`}
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      );
    }

    // ============================================================
    // LINK VARIANT
    // ============================================================

    if (variant === 'link') {
      return (
        <div className={cn('flex justify-center py-4', className)}>
          <Button
            ref={ref}
            variant="link"
            onClick={onClick}
            disabled={isLoading}
            className="gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                {children ?? 'Ver mais'}
                {remaining && ` (+${remaining})`}
              </>
            )}
          </Button>
        </div>
      );
    }

    // ============================================================
    // MINIMAL VARIANT
    // ============================================================

    return (
      <div className={cn('flex justify-center py-2', className)}>
        <Button
          ref={ref}
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={isLoading}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <MoreHorizontal className="h-3 w-3" />
              {children ?? 'mais'}
            </>
          )}
        </Button>
      </div>
    );
  }
);

LoadMoreButton.displayName = 'LoadMoreButton';

// ============================================================
// INFINITE SCROLL TRIGGER (para intersection observer)
// ============================================================

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  className?: string;
}

export const InfiniteScrollTrigger = forwardRef<HTMLDivElement, InfiniteScrollTriggerProps>(
  ({ onIntersect, isLoading = false, hasMore = true, className }, ref) => {
    if (!hasMore) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'flex justify-center items-center py-4 min-h-[60px]',
          className
        )}
      >
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Carregando mais...</span>
          </div>
        )}
      </div>
    );
  }
);

InfiniteScrollTrigger.displayName = 'InfiniteScrollTrigger';

// ============================================================
// PROGRESS INDICATOR
// ============================================================

interface LoadProgressProps {
  loadedCount: number;
  totalCount: number;
  className?: string;
}

export function LoadProgress({ loadedCount, totalCount, className }: LoadProgressProps) {
  const percentage = Math.min(100, Math.round((loadedCount / totalCount) * 100));

  return (
    <div className={cn('text-center text-xs text-muted-foreground', className)}>
      <span>
        {loadedCount} de {totalCount} ({percentage}%)
      </span>
    </div>
  );
}

export default LoadMoreButton;
