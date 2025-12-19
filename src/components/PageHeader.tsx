import { memo, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  backLink?: string;
  showBack?: boolean;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

function PageHeaderComponent({
  title,
  description,
  children,
  actions,
  backLink,
  showBack = false,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backLink) {
      navigate(backLink);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
      {children}
    </div>
  );
}

export const PageHeader = memo(PageHeaderComponent);

// ============================================================
// PAGE HEADER WITH TABS
// ============================================================

interface PageHeaderWithTabsProps extends PageHeaderProps {
  tabs: ReactNode;
}

function PageHeaderWithTabsComponent({
  tabs,
  ...headerProps
}: PageHeaderWithTabsProps) {
  return (
    <div className="space-y-4">
      <PageHeader {...headerProps} />
      {tabs}
    </div>
  );
}

export const PageHeaderWithTabs = memo(PageHeaderWithTabsComponent);

// ============================================================
// PAGE HEADER WITH BREADCRUMBS
// ============================================================

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderWithBreadcrumbsProps extends PageHeaderProps {
  breadcrumbs: Breadcrumb[];
}

function PageHeaderWithBreadcrumbsComponent({
  breadcrumbs,
  ...headerProps
}: PageHeaderWithBreadcrumbsProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && <span>/</span>}
            {crumb.href ? (
              <button
                onClick={() => navigate(crumb.href!)}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </div>
        ))}
      </nav>
      <PageHeader {...headerProps} />
    </div>
  );
}

export const PageHeaderWithBreadcrumbs = memo(PageHeaderWithBreadcrumbsComponent);
