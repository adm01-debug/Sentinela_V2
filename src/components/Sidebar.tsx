import { memo, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { prefetchRoute } from '@/App';
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
  titleKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigationItems: NavItem[] = [
  { titleKey: 'navigation.dashboard', href: '/', icon: LayoutDashboard },
  { titleKey: 'navigation.employees', href: '/employees', icon: Users },
  { titleKey: 'navigation.teams', href: '/teams', icon: Users },
  { titleKey: 'navigation.monitoring', href: '/monitoring', icon: Monitor },
  { titleKey: 'navigation.violations', href: '/violations', icon: AlertTriangle },
  { titleKey: 'navigation.policies', href: '/violation-rules', icon: Shield },
  { titleKey: 'navigation.reports', href: '/reports', icon: FileText },
  { titleKey: 'navigation.devices', href: '/devices', icon: Smartphone },
  { titleKey: 'navigation.mobileMonitoring', href: '/mobile-monitoring', icon: Smartphone },
  { titleKey: 'navigation.geofencing', href: '/geofencing', icon: Map },
  { titleKey: 'navigation.schedules', href: '/work-schedules', icon: Calendar },
  { titleKey: 'navigation.policies', href: '/monitoring-policies', icon: ClipboardCheck },
  { titleKey: 'common.actions', href: '/policy-acknowledgments', icon: ClipboardCheck },
  { titleKey: 'dashboard.productivity', href: '/productivity-comparison', icon: BarChart3 },
  { titleKey: 'navigation.aiAnalysis', href: '/ai-analysis', icon: Brain },
  { titleKey: 'navigation.gamification', href: '/gamification', icon: Award },
  { titleKey: 'navigation.internetAccess', href: '/internet-access', icon: Globe },
  { titleKey: 'navigation.security', href: '/rate-limit-dashboard', icon: Shield },
  { titleKey: 'navigation.keywords', href: '/sensitive-keywords', icon: FileSearch },
  { titleKey: 'navigation.templates', href: '/message-templates', icon: MessageSquare },
  { titleKey: 'navigation.webhooks', href: '/webhooks', icon: Webhook },
  { titleKey: 'common.settings', href: '/whatsapp-integration', icon: MessageSquare },
  { titleKey: 'reports.schedule', href: '/scheduled-reports', icon: Clock },
  { titleKey: 'navigation.dataExport', href: '/data-export', icon: FileText },
  { titleKey: 'navigation.agentKeys', href: '/agent-keys', icon: Key },
  { titleKey: 'navigation.userManagement', href: '/user-management', icon: UserCog },
  { titleKey: 'navigation.security', href: '/security', icon: Shield },
  { titleKey: 'common.settings', href: '/settings', icon: Settings },
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
  const { t } = useTranslation();
  const Icon = item.icon;
  const title = t(item.titleKey);

  const handleMouseEnter = useCallback(() => {
    prefetchRoute(item.href);
  }, [item.href]);

  const content = (
    <NavLink
      to={item.href}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span className="truncate">{title}</span>}
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
          {title}
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
