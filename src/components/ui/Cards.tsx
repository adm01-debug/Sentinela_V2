import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  GripVertical,
  Pin,
  Archive,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ============================================
// EXPANDABLE CARD
// ============================================

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export function ExpandableCard({
  title,
  subtitle,
  badge,
  badgeVariant = "secondary",
  defaultOpen = false,
  children,
  headerAction,
  className,
}: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("rounded-lg border bg-card", className)}>
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{title}</h3>
                  {badge && (
                    <Badge variant={badgeVariant} className="text-xs">
                      {badge}
                    </Badge>
                  )}
                </div>
                {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {headerAction}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-4 pb-4 pt-0">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ============================================
// ACTION CARD
// ============================================

interface ActionCardProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
    destructive?: boolean;
  }>;
  onPin?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  isPinned?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  actions = [],
  onPin,
  onArchive,
  onDelete,
  isPinned = false,
  className,
  children,
}: ActionCardProps) {
  const hasQuickActions = onPin || onArchive || onDelete;

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-4 transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{title}</h3>
                {isPinned && <Pin className="h-3 w-3 text-primary" />}
              </div>
              {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
            </div>
            {(actions.length > 0 || hasQuickActions) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, i) => (
                    <DropdownMenuItem
                      key={i}
                      onClick={action.onClick}
                      className={action.destructive ? "text-destructive" : ""}
                    >
                      {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                  {actions.length > 0 && hasQuickActions && <DropdownMenuSeparator />}
                  {onPin && (
                    <DropdownMenuItem onClick={onPin}>
                      <Pin className="mr-2 h-4 w-4" />
                      {isPinned ? "Desafixar" : "Fixar"}
                    </DropdownMenuItem>
                  )}
                  {onArchive && (
                    <DropdownMenuItem onClick={onArchive}>
                      <Archive className="mr-2 h-4 w-4" />
                      Arquivar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// DRAGGABLE CARD
// ============================================

interface DraggableCardProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  className?: string;
}

export function DraggableCard({
  children,
  onDragStart,
  onDragEnd,
  isDragging = false,
  className,
}: DraggableCardProps) {
  return (
    <div
      className={cn(
        "group rounded-lg border bg-card transition-all",
        isDragging && "border-primary/50 opacity-90 shadow-lg",
        className
      )}
    >
      <div className="flex">
        <div
          role="button"
          tabIndex={0}
          aria-label="Drag handle"
          className="flex cursor-grab items-center justify-center border-r px-2 opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

// ============================================
// SELECTION CARD
// ============================================

interface SelectionCardProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function SelectionCard({
  title,
  description,
  icon: Icon,
  selected = false,
  disabled = false,
  onSelect,
  className,
}: SelectionCardProps) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={cn(
        "cursor-pointer rounded-lg border-2 p-4 transition-all",
        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              selected ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h3 className="font-medium">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {selected && (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <svg
            className="h-3 w-3 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ============================================
// METRIC CARD
// ============================================

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label?: string;
  };
  icon?: React.ElementType;
  trend?: "up" | "down" | "neutral";
  footer?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  footer,
  className,
}: MetricCardProps) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-muted-foreground",
  };

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="mb-2 flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {change && trend && (
          <span className={cn("text-sm font-medium", trendColors[trend])}>
            {trend === "up" ? "+" : trend === "down" ? "-" : ""}
            {Math.abs(change.value)}%
          </span>
        )}
      </div>
      {change?.label && <p className="mt-1 text-xs text-muted-foreground">{change.label}</p>}
      {footer && <div className="mt-3 border-t pt-3">{footer}</div>}
    </div>
  );
}

export default {
  ExpandableCard,
  ActionCard,
  DraggableCard,
  SelectionCard,
  MetricCard,
};
