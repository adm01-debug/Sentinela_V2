import React, { memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  className?: string;
  maxItems?: number;
}

// Route label mapping
const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  'employees': 'Funcionários',
  'teams': 'Equipes',
  'monitoring': 'Monitoramento',
  'violations': 'Violações',
  'violation-rules': 'Políticas',
  'reports': 'Relatórios',
  'devices': 'Dispositivos',
  'mobile-monitoring': 'Monitoramento Mobile',
  'geofencing': 'Geofencing',
  'work-schedules': 'Jornadas',
  'monitoring-policies': 'Políticas de Monitoramento',
  'policy-acknowledgments': 'Aceites de Política',
  'productivity-comparison': 'Produtividade',
  'ai-analysis': 'Análise IA',
  'gamification': 'Gamificação',
  'internet-access': 'Acesso à Internet',
  'rate-limit-dashboard': 'Rate Limit',
  'sensitive-keywords': 'Palavras-chave',
  'message-templates': 'Templates',
  'webhooks': 'Webhooks',
  'whatsapp-integration': 'WhatsApp',
  'scheduled-reports': 'Relatórios Agendados',
  'data-export': 'Exportação',
  'agent-keys': 'Chaves do Agente',
  'user-management': 'Usuários',
  'security': 'Segurança',
  'settings': 'Configurações',
};

export const DynamicBreadcrumbs = memo(function DynamicBreadcrumbs({
  showHome = true,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  className,
  maxItems = 4,
}: BreadcrumbsProps) {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    if (showHome) {
      items.push({
        label: 'Home',
        href: '/',
        icon: Home,
      });
    }

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      items.push({
        label,
        href: index < pathSegments.length - 1 ? currentPath : undefined,
      });
    });

    // Collapse middle items if too many
    if (items.length > maxItems) {
      const first = items.slice(0, 1);
      const last = items.slice(-2);
      return [
        ...first,
        { label: '...', href: undefined },
        ...last,
      ];
    }

    return items;
  }, [location.pathname, showHome, maxItems]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;

          return (
            <motion.li
              key={`${item.label}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center"
            >
              {index > 0 && (
                <span className="mx-1" aria-hidden="true">
                  {separator}
                </span>
              )}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
});

// Static Breadcrumbs for custom use
export const Breadcrumbs = memo(function Breadcrumbs({
  items = [],
  showHome = true,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  className,
}: BreadcrumbsProps) {
  const allItems = useMemo(() => {
    if (showHome) {
      return [{ label: 'Home', href: '/', icon: Home }, ...items];
    }
    return items;
  }, [items, showHome]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {index > 0 && (
                <span className="mx-1" aria-hidden="true">
                  {separator}
                </span>
              )}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

// Page Context Header with Breadcrumbs
interface PageContextHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageContextHeader = memo(function PageContextHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: PageContextHeaderProps) {
  return (
    <div className="space-y-2 pb-4 border-b mb-6">
      {breadcrumbs ? (
        <Breadcrumbs items={breadcrumbs} />
      ) : (
        <DynamicBreadcrumbs />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
});

// Related Pages Suggestions
interface RelatedPage {
  title: string;
  href: string;
  description?: string;
}

interface RelatedPagesSuggestionsProps {
  pages: RelatedPage[];
  title?: string;
}

export const RelatedPagesSuggestions = memo(function RelatedPagesSuggestions({
  pages,
  title = 'Páginas Relacionadas',
}: RelatedPagesSuggestionsProps) {
  if (pages.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <div className="space-y-2">
        {pages.map((page) => (
          <Link
            key={page.href}
            to={page.href}
            className="block p-2 rounded-md hover:bg-accent transition-colors"
          >
            <div className="text-sm font-medium">{page.title}</div>
            {page.description && (
              <div className="text-xs text-muted-foreground">{page.description}</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
});

// Navigation History Hook
export function useNavigationHistory(maxItems = 10) {
  const [history, setHistory] = React.useState<string[]>([]);
  const location = useLocation();

  React.useEffect(() => {
    setHistory((prev) => {
      const newHistory = [location.pathname, ...prev.filter((p) => p !== location.pathname)];
      return newHistory.slice(0, maxItems);
    });
  }, [location.pathname, maxItems]);

  const goBack = React.useCallback(() => {
    if (history.length > 1) {
      window.history.back();
    }
  }, [history]);

  const canGoBack = history.length > 1;

  return { history, goBack, canGoBack };
}
