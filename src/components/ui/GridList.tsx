import { memo } from 'react';
import { cn } from '@/lib/utils';

interface GridListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

function GridListComponent<T>({
  items,
  renderItem,
  keyExtractor,
  columns = 3,
  gap = 'md',
  className,
}: GridListProps<T>) {
  return (
    <div className={cn("grid", columnClasses[columns], gapClasses[gap], className)}>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}

export const GridList = memo(GridListComponent) as typeof GridListComponent;
