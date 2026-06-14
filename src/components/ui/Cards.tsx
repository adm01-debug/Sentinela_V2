import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal, GripVertical, Pin, Archive, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================
// EXPANDABLE CARD
// ============================================

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export function ExpandableCard({
  title,
  subtitle,
  badge,
  badgeVariant = 'secondary',
  defaultOpen = false,
  children,
  headerAction,
  className,
}: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn('rounded-lg border bg-card', className)}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
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
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {headerAction}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 border-t">
            {children}
          </div>
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
    <div className={cn('group rounded-lg border bg-card p-4 transition-all hover:shadow-md', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{title}</h3>
                {isPinned && <Pin className="h-3 w-3 text-primary" />}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
            {(actions.length > 0 || hasQuickActions) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, i) => (
                    <DropdownMenuItem
                      key={i}
                      onClick={action.onClick}
                      className={action.destructive ? 'text-destructive' : ''}
                    >
                      {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                  {actions.length > 0 && hasQuickActions && <DropdownMenuSeparator />}
                  {onPin && (
                    <DropdownMenuItem onClick={onPin}>
                      <Pin className="h-4 w-4 mr-2" />
                      {isPinned ? 'Desafixar' : 'Fixar'}
                    </DropdownMenuItem>
                  )}
                  {onArchive && (
                    <DropdownMenuItem onClick={onArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      Arquivar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
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
        'group rounded-lg border bg-card transition-all',
        isDragging && 'shadow-lg border-primary/50 opacity-90',
        className
      )}
    >
      <div className="flex">
        <div
          role="button"
          tabIndex={0}
          aria-label="Drag handle"
          className="flex items-center justify-center px-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity border-r"
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
        'rounded-lg border-2 p-4 transition-all cursor-pointer',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
            selected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  trend?: 'up' | 'down' | 'neutral';
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
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {change && trend && (
          <span className={cn('text-sm font-medium', trendColors[trend])}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
            {Math.abs(change.value)}%
          </span>
        )}
      </div>
      {change?.label && (
        <p className="text-xs text-muted-foreground mt-1">{change.label}</p>
      )}
      {footer && <div className="mt-3 pt-3 border-t">{footer}</div>}
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
