import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================
// BREADCRUMB
// ============================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  maxItems?: number;
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({
  items,
  showHome = true,
  homeHref = '/',
  maxItems = 4,
  separator,
  className,
}: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: 'Início', href: homeHref, icon: Home }, ...items]
    : items;

  const shouldCollapse = allItems.length > maxItems;
  const visibleItems: any[] = shouldCollapse
    ? [allItems[0], { label: '...', collapsed: true }, ...allItems.slice(-2)]
    : allItems;
  const collapsedItems = shouldCollapse
    ? allItems.slice(1, -2)
    : [];

  const Separator = separator || <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1.5 text-sm">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const Icon = item.icon;

          if ((item as any).collapsed) {
            return (
              <React.Fragment key="collapsed">
                <li className="flex items-center gap-1.5">
                  {Separator}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {collapsedItems.map((collapsed, i) => (
                        <DropdownMenuItem key={i} asChild>
                          <Link to={collapsed.href || '#'}>
                            {collapsed.icon && <collapsed.icon className="h-4 w-4 mr-2" />}
                            {collapsed.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              </React.Fragment>
            );
          }

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && Separator}
              {isLast ? (
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1.5">
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ============================================
// PAGE HEADER
// ============================================

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  tabs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {tabs}
    </div>
  );
}

// ============================================
// SECTION HEADER
// ============================================

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  size = 'md',
  className,
}: SectionHeaderProps) {
  const sizeStyles = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className={cn('font-semibold', sizeStyles[size])}>{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ============================================
// CARD HEADER
// ============================================

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 p-4 border-b', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div>
          <h3 className="font-medium">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// ============================================
// DIVIDER WITH LABEL
// ============================================

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (!label) {
    return <hr className={cn('border-border', className)} />;
  }

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export default {
  Breadcrumb,
  PageHeader,
  SectionHeader,
  CardHeader,
  Divider,
};
