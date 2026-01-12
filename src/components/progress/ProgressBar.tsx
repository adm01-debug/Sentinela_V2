import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variants = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

const sizes = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

export function ProgressBar({ value, max = 100, showLabel, size = 'md', variant = 'default', className }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizes[size])}>
        <div className={cn('h-full transition-all duration-300', variants[variant])} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && <span className="text-xs text-muted-foreground mt-1">{percentage.toFixed(0)}%</span>}
    </div>
  );
}
