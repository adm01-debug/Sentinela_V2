import { memo, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Monitor,
  FileText,
  Bell,
  Map,
  MessageSquare,
  Webhook,
  Calendar,
  Award,
  Clock,
  AlertTriangle,
  Globe,
  Key,
  BarChart3,
  Smartphone,
  FileSearch,
  Brain,
  UserCog,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebarStore } from '@/lib/stores';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigationItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Funcionários', href: '/employees', icon: Users },
  { title: 'Equipes', href: '/teams', icon: Users },
  { title: 'Monitoramento', href: '/monitoring', icon: Monitor },
  { title: 'Violações', href: '/violations', icon: AlertTriangle },
  { title: 'Regras', href: '/violation-rules', icon: Shield },
  { title: 'Relatórios', href: '/reports', icon: FileText },
  { title: 'Dispositivos', href: '/devices', icon: Smartphone },
  { title: 'Mobile', href: '/mobile-monitoring', icon: Smartphone },
  { title: 'Geofencing', href: '/geofencing', icon: Map },
  { title: 'Horários', href: '/work-schedules', icon: Calendar },
  { title: 'Políticas', href: '/monitoring-policies', icon: ClipboardCheck },
  { title: 'Aceites', href: '/policy-acknowledgments', icon: ClipboardCheck },
  { title: 'Produtividade', href: '/productivity-comparison', icon: BarChart3 },
  { title: 'AI Analysis', href: '/ai-analysis', icon: Brain },
  { title: 'Gamificação', href: '/gamification', icon: Award },
  { title: 'Internet', href: '/internet-access', icon: Globe },
  { title: 'Rate Limit', href: '/rate-limit-dashboard', icon: Shield },
  { title: 'Keywords', href: '/sensitive-keywords', icon: FileSearch },
  { title: 'Templates', href: '/message-templates', icon: MessageSquare },
  { title: 'Webhooks', href: '/webhooks', icon: Webhook },
  { title: 'WhatsApp', href: '/whatsapp-integration', icon: MessageSquare },
  { title: 'Agendados', href: '/scheduled-reports', icon: Clock },
  { title: 'Exportar', href: '/data-export', icon: FileText },
  { title: 'Agent Keys', href: '/agent-keys', icon: Key },
  { title: 'Usuários', href: '/user-management', icon: UserCog },
  { title: 'Segurança', href: '/security', icon: Shield },
  { title: 'Config', href: '/settings', icon: Settings },
];

interface NavItemComponentProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}

const NavItemComponent = memo(function NavItemComponent({
  item,
  isCollapsed,
  isActive,
}: NavItemComponentProps) {
  const Icon = item.icon;

  const content = (
    <NavLink
      to={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span className="truncate">{item.title}</span>}
      {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </NavLink>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {item.title}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="ml-auto text-muted-foreground">{item.badge}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
});

function SidebarComponent() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isCollapsed, toggle } = useSidebarStore();

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleToggle = useCallback(() => {
    toggle();
  }, [toggle]);

  const navItems = useMemo(() => {
    return navigationItems.map((item) => ({
      ...item,
      isActive: location.pathname === item.href,
    }));
  }, [location.pathname]);

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!isCollapsed && (
          <span className="text-lg font-semibold">Sentinela</span>
        )}
        <Button variant="ghost" size="icon" onClick={handleToggle}>
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              isCollapsed={isCollapsed}
              isActive={item.isActive}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className={cn('w-full justify-start', isCollapsed && 'justify-center')}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </div>
  );
}

export const Sidebar = memo(SidebarComponent);
