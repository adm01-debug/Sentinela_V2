import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { cn } from "@/lib/utils";

// Stats Card for KPIs
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  className?: string;
}

const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-elevation-2",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              trend.isPositive !== false
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {trend.isPositive !== false ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          {trend.label && (
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Empty State
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

// Data List Item
interface DataListItemProps {
  label: string;
  value: React.ReactNode;
  tooltip?: string;
  className?: string;
}

const DataListItem = ({ label, value, tooltip, className }: DataListItemProps) => {
  const content = (
    <div
      className={cn(
        "flex items-center justify-between py-3 border-b border-border/50 last:border-0",
        className
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

// Status Indicator
const statusIndicatorVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        active: "bg-success/10 text-success",
        inactive: "bg-muted text-muted-foreground",
        pending: "bg-warning/10 text-warning",
        error: "bg-destructive/10 text-destructive",
        info: "bg-info/10 text-info",
      },
    },
    defaultVariants: {
      status: "active",
    },
  }
);

interface StatusIndicatorProps extends VariantProps<typeof statusIndicatorVariants> {
  label: string;
  showDot?: boolean;
  className?: string;
}

const StatusIndicator = ({
  label,
  status,
  showDot = true,
  className,
}: StatusIndicatorProps) => {
  const dotColors = {
    active: "bg-success",
    inactive: "bg-muted-foreground",
    pending: "bg-warning",
    error: "bg-destructive",
    info: "bg-info",
  };

  return (
    <span className={cn(statusIndicatorVariants({ status }), className)}>
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColors[status || "active"])}
        />
      )}
      {label}
    </span>
  );
};

// Section Header
interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const SectionHeader = ({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// Metric Badge
interface MetricBadgeProps {
  value: string | number;
  label: string;
  color?: "primary" | "success" | "warning" | "destructive" | "info";
  className?: string;
}

const MetricBadge = ({
  value,
  label,
  color = "primary",
  className,
}: MetricBadgeProps) => {
  const colorStyles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    info: "bg-info/10 text-info border-info/20",
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center rounded-lg border px-4 py-2",
        colorStyles[color],
        className
      )}
    >
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
};

export {
  StatsCard,
  EmptyState,
  DataListItem,
  StatusIndicator,
  SectionHeader,
  MetricBadge,
  statusIndicatorVariants,
};