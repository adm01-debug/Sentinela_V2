import React from 'react';
import { cn } from '@/lib/utils';
import { Info, HelpCircle, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

// ============================================
// ENHANCED TOOLTIP
// ============================================

type TooltipVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

interface EnhancedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: TooltipVariant;
  title?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
}

const variantStyles: Record<TooltipVariant, { bg: string; border: string; icon: React.ElementType }> = {
  default: { bg: '', border: '', icon: Info },
  info: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', icon: Info },
  success: { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', icon: CheckCircle },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-200 dark:border-yellow-800', icon: AlertTriangle },
  error: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800', icon: AlertCircle },
};

export function EnhancedTooltip({
  content,
  children,
  variant = 'default',
  title,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  className,
}: EnhancedTooltipProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            'max-w-xs',
            variant !== 'default' && [styles.bg, styles.border, 'border'],
            className
          )}
        >
          {title && (
            <div className="flex items-center gap-1.5 mb-1">
              {variant !== 'default' && <Icon className="h-3.5 w-3.5" />}
              <span className="font-medium text-sm">{title}</span>
            </div>
          )}
          <div className="text-xs">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// HELP TOOLTIP
// ============================================

interface HelpTooltipProps {
  content: React.ReactNode;
  title?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  iconSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HelpTooltip({
  content,
  title,
  side = 'top',
  iconSize = 'md',
  className,
}: HelpTooltipProps) {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <EnhancedTooltip content={content} title={title} side={side} variant="info">
      <button type="button" className={cn('inline-flex text-muted-foreground hover:text-foreground transition-colors', className)}>
        <HelpCircle className={sizes[iconSize]} />
      </button>
    </EnhancedTooltip>
  );
}

// ============================================
// INFO TOOLTIP
// ============================================

interface InfoTooltipProps {
  content: React.ReactNode;
  variant?: TooltipVariant;
  side?: 'top' | 'right' | 'bottom' | 'left';
  iconSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InfoTooltip({
  content,
  variant = 'default',
  side = 'top',
  iconSize = 'md',
  className,
}: InfoTooltipProps) {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const Icon = variantStyles[variant].icon;

  return (
    <EnhancedTooltip content={content} side={side} variant={variant}>
      <button type="button" className={cn('inline-flex text-muted-foreground hover:text-foreground transition-colors', className)}>
        <Icon className={sizes[iconSize]} />
      </button>
    </EnhancedTooltip>
  );
}

// ============================================
// LABEL WITH TOOLTIP
// ============================================

interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  className?: string;
}

export function LabelWithTooltip({
  label,
  tooltip,
  required = false,
  className,
}: LabelWithTooltipProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </span>
      <HelpTooltip content={tooltip} iconSize="sm" />
    </div>
  );
}

export default {
  EnhancedTooltip,
  HelpTooltip,
  InfoTooltip,
  LabelWithTooltip,
};
