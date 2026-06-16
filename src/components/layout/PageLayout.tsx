import { memo, ReactNode, Suspense } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  contentClassName?: string;
  loading?: boolean;
  header?: ReactNode;
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

const paddingClasses = {
  none: "p-0",
  sm: "p-4 md:p-6",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-12",
};

function PageLayoutSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

function PageLayoutComponent({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs = true,
  maxWidth = "2xl",
  padding = "md",
  className,
  contentClassName,
  loading = false,
  header,
}: PageLayoutProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "mx-auto w-full",
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          className
        )}
      >
        <PageLayoutSkeleton />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="mb-4">
          <Breadcrumbs />
        </div>
      )}

      {/* Header */}
      {header ? (
        header
      ) : title || subtitle || actions ? (
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title && <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>}
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      ) : null}

      {/* Content */}
      <main className={cn("space-y-6", contentClassName)}>
        <Suspense fallback={<PageLayoutSkeleton />}>{children}</Suspense>
      </main>
    </div>
  );
}

export const PageLayout = memo(PageLayoutComponent);

// ============================================================
// PAGE SECTION COMPONENT
// ============================================================

interface PageSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

function PageSectionComponent({ children, title, subtitle, actions, className }: PageSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export const PageSection = memo(PageSectionComponent);

// ============================================================
// PAGE GRID COMPONENT
// ============================================================

interface PageGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

function PageGridComponent({ children, columns = 2, gap = "md", className }: PageGridProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div className={cn("grid", columnClasses[columns], gapClasses[gap], className)}>{children}</div>
  );
}

export const PageGrid = memo(PageGridComponent);
