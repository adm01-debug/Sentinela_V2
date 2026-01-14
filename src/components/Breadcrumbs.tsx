import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  className?: string;
}

// Route to label mapping
const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  'employees': 'Funcionários',
  'teams': 'Equipes',
  'gamification': 'Gamificação',
  'monitoring': 'Monitoramento',
  'mobile-monitoring': 'Mobile',
  'devices': 'Dispositivos',
  'productivity-comparison': 'Produtividade',
  'ai-analysis': 'Análise IA',
  'violations': 'Violações',
  'violation-rules': 'Regras',
  'monitoring-policies': 'Políticas',
  'rate-limit-dashboard': 'Rate Limit',
  'security': 'Segurança',
  'geofencing': 'Geofencing',
  'work-schedules': 'Horários',
  'internet-access': 'Internet',
  'reports': 'Relatórios',
  'data-export': 'Exportar',
  'agent-keys': 'Agent Keys',
  'webhooks': 'Webhooks',
  'whatsapp': 'WhatsApp',
  'message-templates': 'Templates',
  'user-management': 'Usuários',
  'settings': 'Configurações',
};

function BreadcrumbsComponent({ className }: BreadcrumbsProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center gap-1">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          const label = routeLabels[segment] || segment;

          return (
            <li key={path} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4" />
              {isLast ? (
                <span className="font-medium text-foreground">{label}</span>
              ) : (
                <Link
                  to={path}
                  className="hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const Breadcrumbs = memo(BreadcrumbsComponent);
export default Breadcrumbs;
