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
  '/analytics/productivity': 'Produtividade',
  '/analytics/applications': 'Aplicações',
  '/analytics/trends': 'Tendências',
  '/reports': 'Relatórios',
  '/reports/custom': 'Relatórios Customizados',
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
  '/settings/profile': 'Perfil',
  '/settings/security': 'Segurança',
  '/settings/billing': 'Faturamento',
  '/settings/api-keys': 'Chaves API',
  '/admin/departments': 'Departamentos',
  '/admin/teams': 'Equipes',
  '/admin/users': 'Usuários',
  '/admin/roles': 'Papéis',
  '/admin/audit': 'Auditoria',
  '/admin/telemetria': 'Telemetria',
};

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  const pathname = location.pathname;

  // Hide on dashboard and single-segment routes (avoids redundant breadcrumb next to H1)
  const segments = pathname.split('/').filter(Boolean);
  if (pathname === '/dashboard' || pathname === '/' || segments.length <= 1) return null;

  const crumbs: { label: string; path: string }[] = [];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    crumbs.push({ label, path: currentPath });
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn(
        'flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground/60 transition-opacity duration-300 hover:opacity-100', 
        className
      )}
    >
      <Link
        to="/dashboard"
        className="flex items-center hover:text-primary transition-colors p-1 -m-1"
      >
        <Home className="h-3 w-3" />
      </Link>
      {crumbs.map((crumb, i) => (
        <div key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-2.5 w-2.5 opacity-40" />
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-primary/80">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="hover:text-primary transition-colors p-1 -m-1"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
