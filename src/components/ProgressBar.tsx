import { memo, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

// ============================================================
// VARIANT STYLES
// ============================================================

const variantStyles: Record<ProgressVariant, string> = {
  default: '[&>div]:bg-primary',
  success: '[&>div]:bg-green-500',
  warning: '[&>div]:bg-yellow-500',
  danger: '[&>div]:bg-red-500',
  info: '[&>div]:bg-blue-500',
};

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
};

// ============================================================
// ProgressBar Component
// ============================================================

function ProgressBarComponent({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  className,
  animated = false,
}: ProgressBarProps) {
  const percentage = useMemo(() => {
    return Math.min(100, Math.max(0, (value / max) * 100));
  }, [value, max]);

  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">{displayLabel}</span>
        </div>
      )}
      <Progress
        value={percentage}
        className={cn(
          sizeStyles[size],
          variantStyles[variant],
          animated && '[&>div]:transition-all [&>div]:duration-500'
        )}
      />
    </div>
  );
}

export const ProgressBar = memo(ProgressBarComponent);

// ============================================================
// ProgressWithSteps - Step progress indicator
// ============================================================

interface ProgressStep {
  label: string;
  completed?: boolean;
  current?: boolean;
}

interface ProgressWithStepsProps {
  steps: ProgressStep[];
  className?: string;
}

function ProgressWithStepsComponent({ steps, className }: ProgressWithStepsProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-col items-center',
              index < steps.length - 1 && 'flex-1'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                step.completed
                  ? 'border-primary bg-primary text-primary-foreground'
                  : step.current
                  ? 'border-primary text-primary'
                  : 'border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {step.completed ? '✓' : index + 1}
            </div>
            <span
              className={cn(
                'mt-1 text-xs',
                step.completed || step.current
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        {steps.slice(0, -1).map((step, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 mx-2',
              step.completed ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}

export const ProgressWithSteps = memo(ProgressWithStepsComponent);

// ============================================================
// CircularProgress - Circular progress indicator
// ============================================================

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  variant?: ProgressVariant;
  className?: string;
}

const circularVariantColors: Record<ProgressVariant, string> = {
  default: 'stroke-primary',
  success: 'stroke-green-500',
  warning: 'stroke-yellow-500',
  danger: 'stroke-red-500',
  info: 'stroke-blue-500',
};

function CircularProgressComponent({
  value,
  size = 60,
  strokeWidth = 4,
  showLabel = true,
  variant = 'default',
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, value));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className="stroke-muted"
          strokeWidth={strokeWidth}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn(circularVariantColors[variant], 'transition-all duration-300')}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-medium">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

export const CircularProgress = memo(CircularProgressComponent);

// ============================================================
// LoadingProgress - Indeterminate loading bar
// ============================================================

function LoadingProgressComponent({ className }: { className?: string }) {
  return (
    <div className={cn('h-1 w-full overflow-hidden bg-muted', className)}>
      <div className="h-full w-1/3 animate-[loading_1s_ease-in-out_infinite] bg-primary" />
    </div>
  );
}

export const LoadingProgress = memo(LoadingProgressComponent);
