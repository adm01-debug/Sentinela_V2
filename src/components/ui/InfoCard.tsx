import React from 'react';
import { cn } from '@/lib/utils';
import {
  Info,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================
// INFO CARD
// ============================================

type InfoCardVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral';

interface InfoCardProps {
  variant?: InfoCardVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
    external?: boolean;
  };
  className?: string;
}

const variantConfig: Record<InfoCardVariant, {
  icon: React.ElementType;
  bg: string;
  border: string;
  iconColor: string;
}> = {
  info: {
    icon: Info,
    bg: 'bg-info/10',
    border: 'border-info/30',
    iconColor: 'text-info',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-success/10',
    border: 'border-success/30',
    iconColor: 'text-success',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    iconColor: 'text-warning',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    iconColor: 'text-destructive',
  },
  neutral: {
    icon: Info,
    bg: 'bg-muted/50',
    border: 'border-border',
    iconColor: 'text-muted-foreground',
  },
};

export function InfoCard({
  variant = 'info',
  title,
  children,
  icon,
  showIcon = true,
  dismissible = false,
  onDismiss,
  action,
  className,
}: InfoCardProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4',
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex gap-3">
        {showIcon && (
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconColor)} />
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium text-sm mb-1">{title}</h4>
          )}
          <div className="text-sm text-muted-foreground">{children}</div>
          {action && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-2 text-sm"
              onClick={action.onClick}
            >
              {action.label}
              {action.external ? (
                <ExternalLink className="h-3 w-3 ml-1" />
              ) : (
                <ChevronRight className="h-3 w-3 ml-1" />
              )}
            </Button>
          )}
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 -mt-1 -mr-1"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================
// CALLOUT
// ============================================

interface CalloutProps {
  variant?: InfoCardVariant;
  children: React.ReactNode;
  className?: string;
}

export function Callout({ variant = 'info', children, className }: CalloutProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        'border-l-4 pl-4 py-2',
        config.border,
        className
      )}
    >
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ============================================
// FEATURE CARD
// ============================================

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  onClick,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border bg-card transition-all duration-200',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// ============================================
// STAT HIGHLIGHT
// ============================================

interface StatHighlightProps {
  value: string | number;
  label: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: React.ElementType;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function StatHighlight({
  value,
  label,
  trend,
  icon: Icon,
  variant = 'default',
  className,
}: StatHighlightProps) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-success/10 border-success/30',
    warning: 'bg-warning/10 border-warning/30',
    error: 'bg-destructive/10 border-destructive/30',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      {trend && (
        <div className={cn(
          'flex items-center gap-1 mt-2 text-xs font-medium',
          trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
        )}>
          <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-muted-foreground font-normal">vs período anterior</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// TIP CARD
// ============================================

interface TipCardProps {
  tip: string;
  title?: string;
  onDismiss?: () => void;
  className?: string;
}

export function TipCard({ tip, title = 'Dica', onDismiss, className }: TipCardProps) {
  return (
    <InfoCard
      variant="info"
      title={title}
      dismissible={!!onDismiss}
      onDismiss={onDismiss}
      className={className}
    >
      {tip}
    </InfoCard>
  );
}

export default {
  InfoCard,
  Callout,
  FeatureCard,
  StatHighlight,
  TipCard,
};
