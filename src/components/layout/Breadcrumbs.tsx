import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/employees': 'Funcionários',
  '/activities': 'Atividades',
  '/monitoring': 'Monitoramento',
  '/time-clock': 'Ponto Digital',
  '/projects': 'Projetos & Tarefas',
  '/timesheets': 'Folhas de Ponto',
  '/attendance': 'Assiduidade',
  '/hours-tracking': 'Tracking de Horas',
  '/violations': 'Violações',
  '/alerts': 'Alertas',
  '/screenshots': 'Screenshots',
  '/internet-access': 'Acesso Internet',
  '/analytics': 'Analytics',
  '/reports': 'Relatórios',
  '/ai-analysis': 'Análise IA',
  '/devices': 'Dispositivos',
  '/geofencing': 'Geofencing',
  '/calendar': 'Calendário',
  '/work-schedules': 'Horários',
  '/gamification': 'Gamificação',
  '/compliance': 'Compliance',
  '/export': 'Exportação',
  '/integrations': 'Integrações',
  '/settings': 'Configurações',
  '/admin/departments': 'Departamentos',
  '/admin/teams': 'Equipes',
  '/admin/users': 'Usuários',
  '/admin/roles': 'Papéis',
  '/admin/audit': 'Auditoria',
};

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === '/dashboard' || pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; path: string }[] = [];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    crumbs.push({ label, path: currentPath });
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        to="/dashboard"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <div key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
