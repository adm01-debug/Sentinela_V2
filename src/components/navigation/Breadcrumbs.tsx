import { memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// ============================================================
// ROUTE CONFIGURATION
// ============================================================

interface RouteConfig {
  label: string;
  icon?: React.ReactNode;
  parent?: string;
}

const routeLabels: Record<string, RouteConfig> = {
  '/': { label: 'Dashboard' },
  '/dashboard': { label: 'Dashboard' },
  '/employees': { label: 'Colaboradores', parent: '/' },
  '/teams': { label: 'Equipes', parent: '/employees' },
  '/devices': { label: 'Dispositivos', parent: '/' },
  '/gamification': { label: 'Gamificação', parent: '/' },
  '/monitoring': { label: 'Monitoramento', parent: '/' },
  '/mobile-monitoring': { label: 'Mobile', parent: '/monitoring' },
  '/violations': { label: 'Violações', parent: '/monitoring' },
  '/violation-rules': { label: 'Regras', parent: '/violations' },
  '/security': { label: 'Segurança', parent: '/monitoring' },
  '/geofencing': { label: 'Geofencing', parent: '/monitoring' },
  '/work-schedules': { label: 'Escalas de Trabalho', parent: '/' },
  '/agent-keys': { label: 'Chaves de Agente', parent: '/' },
  '/webhooks': { label: 'Webhooks', parent: '/' },
  '/whatsapp': { label: 'WhatsApp', parent: '/' },
  '/message-templates': { label: 'Templates de Mensagem', parent: '/whatsapp' },
  '/reports': { label: 'Relatórios', parent: '/' },
  '/scheduled-reports': { label: 'Agendados', parent: '/reports' },
  '/data-export': { label: 'Exportação', parent: '/reports' },
  '/ai-analysis': { label: 'Análise IA', parent: '/reports' },
  '/productivity-comparison': { label: 'Comparação', parent: '/reports' },
  '/internet-access': { label: 'Acesso à Internet', parent: '/' },
  '/sensitive-keywords': { label: 'Palavras Sensíveis', parent: '/' },
  '/monitoring-policies': { label: 'Políticas', parent: '/' },
  '/policy-acknowledgments': { label: 'Aceites', parent: '/monitoring-policies' },
  '/user-management': { label: 'Usuários', parent: '/' },
  '/rate-limit-dashboard': { label: 'Rate Limit', parent: '/' },
  '/settings': { label: 'Configurações', parent: '/' },
  '/settings/profile': { label: 'Perfil', parent: '/settings' },
  '/settings/security': { label: 'Segurança', parent: '/settings' },
  '/settings/billing': { label: 'Faturamento', parent: '/settings' },
};

// ============================================================
// BREADCRUMBS COMPONENT
// ============================================================

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

function BreadcrumbsBase({ className, showHome = true }: BreadcrumbsProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Build breadcrumb trail
  const breadcrumbTrail = useMemo(() => {
    const trail: { path: string; label: string; isCurrent: boolean }[] = [];
    
    // Normalize path (remove trailing slash)
    let normalizedPath = currentPath.endsWith('/') && currentPath !== '/' ? currentPath.slice(0, -1) : currentPath;
    
    // Handle dynamic routes (UUID check)
    const basePath = normalizedPath.replace(/\/[a-f0-9-]{36}$/, '');
    const hasDynamicSegment = basePath !== normalizedPath;
    
    let path = basePath;
    const visited = new Set<string>();
    
    while (path && !visited.has(path)) {
      visited.add(path);
      const config = routeLabels[path];
      
      if (config) {
        trail.unshift({
          path,
          label: config.label,
          isCurrent: path === normalizedPath && !hasDynamicSegment,
        });
        path = config.parent || '';
      } else {
        // Fallback for paths not in labels
        const segments = path.split('/');
        const lastSegment = segments[segments.length - 1];
        if (lastSegment) {
          trail.unshift({
            path,
            label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' '),
            isCurrent: path === normalizedPath && !hasDynamicSegment,
          });
        }
        
        // Try to go up one level
        path = segments.slice(0, -1).join('/') || (segments.length > 1 ? '/' : '');
      }
    }
    
    // Add dynamic segment label if present
    if (hasDynamicSegment) {
      trail.push({
        path: normalizedPath,
        label: 'Detalhes',
        isCurrent: true,
      });
    }
    
    // Remove dashboard if it's already shown via Home icon
    return trail.filter(item => item.path !== '/' && item.path !== '/dashboard');
  }, [currentPath]);

  // Don't show breadcrumbs on root
  if (currentPath === '/' || currentPath === '/dashboard') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {showHome && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link 
                    to="/" 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Dashboard</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbTrail.length > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                </BreadcrumbSeparator>
              )}
            </>
          )}
          
          {breadcrumbTrail.map((item, index) => {
            const isLast = index === breadcrumbTrail.length - 1;
            
            return (
              <BreadcrumbItem key={item.path}>
                {item.isCurrent ? (
                  <BreadcrumbPage className="font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink asChild>
                      <Link 
                        to={item.path}
                        className="hover:text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                    {!isLast && (
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                      </BreadcrumbSeparator>
                    )}
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </motion.div>
  );
}

export const Breadcrumbs = memo(BreadcrumbsBase);
export default Breadcrumbs;
