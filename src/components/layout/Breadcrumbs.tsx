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

interface RouteConfig {
  label: string;
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
  '/violations': { label: 'Violações', parent: '/monitoring' },
  '/violation-rules': { label: 'Regras', parent: '/violations' },
  '/settings': { label: 'Configurações', parent: '/' },
  '/settings/profile': { label: 'Perfil', parent: '/settings' },
  '/settings/security': { label: 'Segurança', parent: '/settings' },
  '/settings/billing': { label: 'Faturamento', parent: '/settings' },
};

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

function BreadcrumbsBase({ className, showHome = true }: BreadcrumbsProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const breadcrumbTrail = useMemo(() => {
    const trail: { path: string; label: string; isCurrent: boolean }[] = [];
    let normalizedPath = currentPath.endsWith('/') && currentPath !== '/' ? currentPath.slice(0, -1) : currentPath;
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
        const segments = path.split('/');
        const lastSegment = segments[segments.length - 1];
        if (lastSegment) {
          trail.unshift({
            path,
            label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' '),
            isCurrent: path === normalizedPath && !hasDynamicSegment,
          });
        }
        path = segments.slice(0, -1).join('/') || (segments.length > 1 ? '/' : '');
      }
    }
    
    if (hasDynamicSegment) {
      trail.push({ path: normalizedPath, label: 'Detalhes', isCurrent: true });
    }
    
    return trail.filter(item => item.path !== '/' && item.path !== '/dashboard');
  }, [currentPath]);

  if (currentPath === '/' || currentPath === '/dashboard') return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          {showHome && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Dashboard</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbTrail.length > 0 && <BreadcrumbSeparator><ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" /></BreadcrumbSeparator>}
            </>
          )}
          {breadcrumbTrail.map((item, index) => (
            <BreadcrumbItem key={item.path}>
              {item.isCurrent ? <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage> : (
                <>
                  <BreadcrumbLink asChild><Link to={item.path} className="hover:text-primary transition-colors">{item.label}</Link></BreadcrumbLink>
                  {index < breadcrumbTrail.length - 1 && <BreadcrumbSeparator><ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" /></BreadcrumbSeparator>}
                </>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </motion.div>
  );
}

export const Breadcrumbs = memo(BreadcrumbsBase);
