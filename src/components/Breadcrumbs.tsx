import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route to label mapping
const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Funcionários',
  '/teams': 'Equipes',
  '/devices': 'Dispositivos',
  '/monitoring': 'Monitoramento',
  '/mobile-monitoring': 'Mobile',
  '/violations': 'Violações',
  '/violation-rules': 'Regras',
  '/security': 'Segurança',
  '/geofencing': 'Geofencing',
  '/work-schedules': 'Horários',
  '/agent-keys': 'Agent Keys',
  '/webhooks': 'Webhooks',
  '/whatsapp': 'WhatsApp',
  '/message-templates': 'Templates',
  '/reports': 'Relatórios',
  '/scheduled-reports': 'Agendados',
  '/data-export': 'Exportar',
  '/ai-analysis': 'Análise IA',
  '/productivity-comparison': 'Produtividade',
  '/internet-access': 'Internet',
  '/sensitive-keywords': 'Palavras-chave',
  '/monitoring-policies': 'Políticas',
  '/policy-acknowledgments': 'Aceites',
  '/user-management': 'Usuários',
  '/rate-limit-dashboard': 'Rate Limit',
  '/settings': 'Configurações',
  '/gamification': 'Gamificação',
};

function BreadcrumbsComponent({ items, className, showHome = true }: BreadcrumbsProps) {
  const location = useLocation();

  // Generate breadcrumbs from current path if items not provided
  const breadcrumbs: BreadcrumbItem[] = items || (() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      result.push({
        label,
        href: index < pathSegments.length - 1 ? currentPath : undefined,
      });
    });

    return result;
  })();

  if (breadcrumbs.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center gap-1.5">
        {showHome && (
          <li className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}
        
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            {item.href ? (
              <Link
                to={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export const Breadcrumbs = memo(BreadcrumbsComponent);