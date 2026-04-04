import React from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// STEP PROGRESS
// ============================================

export interface Step {
  id: string;
  label: string;
  description?: string;
  status?: 'pending' | 'current' | 'completed' | 'error';
}

interface StepProgressProps {
  steps: Step[];
  currentStep?: number;
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export function StepProgress({
  steps,
  currentStep = 0,
  variant = 'horizontal',
  size = 'md',
  showLabels = true,
  className,
}: StepProgressProps) {
  const sizeConfig = {
    sm: { circle: 'h-6 w-6', icon: 'h-3 w-3', text: 'text-xs', gap: 'gap-1' },
    md: { circle: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-sm', gap: 'gap-2' },
    lg: { circle: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-base', gap: 'gap-3' },
  };

  const config = sizeConfig[size];

  const getStepStatus = (index, step: Step) => {
    if (step.status) return step.status;
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  if (variant === 'vertical') {
    return (
      <div className={cn('flex flex-col', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index, step);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex">
              <div className="flex flex-col items-center mr-4">
                <StepCircle status={status} size={size} index={index} />
                {!isLast && (
                  <div className={cn(
                    'w-0.5 flex-1 min-h-[40px] my-1',
                    status === 'completed' ? 'bg-primary' : 'bg-muted'
                  )} />
                )}
              </div>
              {showLabels && (
                <div className={cn('pb-8', config.gap)}>
                  <p className={cn(
                    'font-medium',
                    config.text,
                    status === 'current' && 'text-primary',
                    status === 'pending' && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index, step);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className={cn('flex flex-col items-center', config.gap)}>
              <StepCircle status={status} size={size} index={index} />
              {showLabels && (
                <span className={cn(
                  'text-center max-w-[80px] truncate',
                  config.text,
                  status === 'current' && 'text-primary font-medium',
                  status === 'pending' && 'text-muted-foreground'
                )}>
                  {step.label}
                </span>
              )}
            </div>
            {!isLast && (
              <div className={cn(
                'flex-1 h-0.5 mx-2',
                status === 'completed' ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StepCircle({
  status,
  size,
  index,
}: {
  status: 'pending' | 'current' | 'completed' | 'error';
  size: 'sm' | 'md' | 'lg';
  index: number;
}) {
  const sizeConfig = {
    sm: { circle: 'h-6 w-6', icon: 'h-3 w-3' },
    md: { circle: 'h-8 w-8', icon: 'h-4 w-4' },
    lg: { circle: 'h-10 w-10', icon: 'h-5 w-5' },
  };

  const config = sizeConfig[size];

  const statusStyles = {
    pending: 'border-2 border-muted bg-background text-muted-foreground',
    current: 'border-2 border-primary bg-primary text-primary-foreground',
    completed: 'bg-primary text-primary-foreground',
    error: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-medium text-sm',
      config.circle,
      statusStyles[status]
    )}>
      {status === 'completed' ? (
        <Check className={config.icon} />
      ) : status === 'current' ? (
        <Loader2 className={cn(config.icon, 'animate-spin')} />
      ) : (
        <span className="text-xs">{index + 1}</span>
      )}
    </div>
  );
}

// ============================================
// CIRCULAR PROGRESS
// ============================================

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  label?: string;
  color?: string;
  trackColor?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showValue = true,
  label,
  color = 'hsl(var(--primary))',
  trackColor = 'hsl(var(--muted))',
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference - percentage * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(percentage * 100)}%</span>
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      )}
    </div>
  );
}

// ============================================
// LINEAR PROGRESS
// ============================================

interface LinearProgressProps {
  value: number;
  max?: number;
  showValue?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

export function LinearProgress({
  value,
  max = 100,
  showValue = false,
  label,
  size = 'md',
  variant = 'default',
  animated = false,
  striped = false,
  className,
}: LinearProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantStyles = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-destructive',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="font-medium">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantStyles[variant],
            striped && 'bg-stripes',
            animated && 'animate-progress-stripes'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// SEGMENTED PROGRESS
// ============================================

interface SegmentedProgressProps {
  segments: number;
  completed: number;
  size?: 'sm' | 'md' | 'lg';
  gap?: number;
  className?: string;
}

export function SegmentedProgress({
  segments,
  completed,
  size = 'md',
  gap = 2,
  className,
}: SegmentedProgressProps) {
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('flex w-full', className)} style={{ gap }}>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 rounded-full transition-colors duration-300',
            sizeStyles[size],
            i < completed ? 'bg-primary' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}

// ============================================
// RADIAL PROGRESS (Multiple values)
// ============================================

interface RadialProgressItem {
  value: number;
  max: number;
  color: string;
  label: string;
}

interface RadialProgressProps {
  items: RadialProgressItem[];
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function RadialProgress({
  items,
  size = 150,
  strokeWidth = 10,
  className,
}: RadialProgressProps) {
  const gap = 4;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {items.map((item, index) => {
          const radius = (size - strokeWidth) / 2 - index * (strokeWidth + gap);
          const circumference = radius * 2 * Math.PI;
          const percentage = Math.min(Math.max(item.value / item.max, 0), 1);
          const offset = circumference - percentage * circumference;

          return (
            <React.Fragment key={index}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
                opacity={0.3}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-500 ease-out"
              />
            </React.Fragment>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {items.length === 1 ? (
          <>
            <span className="text-2xl font-bold">
              {Math.round((items[0].value / items[0].max) * 100)}%
            </span>
            <span className="text-xs text-muted-foreground">{items[0].label}</span>
          </>
        ) : (
          <div className="space-y-0.5">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{Math.round((item.value / item.max) * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default {
  StepProgress,
  CircularProgress,
  LinearProgress,
  SegmentedProgress,
  RadialProgress,
};
