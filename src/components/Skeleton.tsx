import { cn } from '@/utils/cn';
interface SkeletonProps { width?: number | string; height?: number | string; className?: string; }
export const Skeleton = ({ width = '100%', height = 20, className }: SkeletonProps) => (
  <div className={cn('animate-pulse bg-muted rounded', className)} style={{ width: typeof width === 'number' ? width + 'px' : width, height: typeof height === 'number' ? height + 'px' : height }} />
);