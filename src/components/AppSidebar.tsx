import { memo, useCallback, useState } from 'react';
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
  Map,
  MessageSquare,
  Webhook,
  Calendar,
  Award,
  AlertTriangle,
  Globe,
  Key,
  BarChart3,
  Smartphone,
  Brain,
  UserCog,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  FileSearch,
  Clock,
  Gauge,
  Building2,
  Activity,
  MapPin,
  Layers,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    id: 'overview',
    title: 'Visão Geral',
    icon: Gauge,
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard },
      { title: 'Análise IA', href: '/ai-analysis', icon: Brain },
    ],
  },
  {
    id: 'workforce',
    title: 'Equipe',
    icon: Users,
    items: [
      { title: 'Funcionários', href: '/employees', icon: Users },
      { title: 'Equipes', href: '/teams', icon: Building2 },
      { title: 'Gamificação', href: '/gamification', icon: Award },
    ],
  },
  {
    id: 'monitoring',
    title: 'Monitoramento',
    icon: Activity,
    items: [
      { title: 'Atividade', href: '/monitoring', icon: Monitor },
      { title: 'Mobile', href: '/mobile-monitoring', icon: Smartphone },
      { title: 'Produtividade', href: '/productivity-comparison', icon: BarChart3 },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance',
    icon: Shield,
    items: [
      { title: 'Violações', href: '/violations', icon: AlertTriangle },
      { title: 'Regras', href: '/violation-rules', icon: ClipboardCheck },
      { title: 'Políticas', href: '/monitoring-policies', icon: Shield },
      { title: 'Palavras-chave', href: '/sensitive-keywords', icon: FileSearch },
      { title: 'Aceites', href: '/policy-acknowledgments', icon: ClipboardCheck },
    ],
  },
  {
    id: 'location',
    title: 'Localização',
    icon: MapPin,
    items: [
      { title: 'Geofencing', href: '/geofencing', icon: Map },
      { title: 'Horários', href: '/work-schedules', icon: Calendar },
      { title: 'Internet', href: '/internet-access', icon: Globe },
    ],
  },
  {
    id: 'reports',
    title: 'Relatórios',
    icon: FileText,
    items: [
      { title: 'Relatórios', href: '/reports', icon: FileText },
      { title: 'Agendados', href: '/scheduled-reports', icon: Clock },
      { title: 'Exportar', href: '/data-export', icon: Layers },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrações',
    icon: Zap,
    items: [
      { title: 'Webhooks', href: '/webhooks', icon: Webhook },
      { title: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
      { title: 'Templates', href: '/message-templates', icon: MessageSquare },
    ],
  },
  {
    id: 'system',
    title: 'Sistema',
    icon: Settings,
    items: [
      { title: 'Dispositivos', href: '/devices', icon: Smartphone },
      { title: 'Agent Keys', href: '/agent-keys', icon: Key },
      { title: 'Usuários', href: '/user-management', icon: UserCog },
      { title: 'Segurança', href: '/security', icon: Shield },
      { title: 'Rate Limit', href: '/rate-limit-dashboard', icon: Gauge },
      { title: 'Configurações', href: '/settings', icon: Settings },
    ],
  },
];

interface NavItemProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}

const NavItemComponent = memo(function NavItemComponent({
  item,
  isCollapsed,
  isActive,
}: NavItemProps) {
  const Icon = item.icon;

  const handleMouseEnter = useCallback(() => {
    prefetchRoute(item.href);
  }, [item.href]);

  const content = (
    <NavLink
      to={item.href}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
        'hover:bg-accent/50 hover:text-accent-foreground',
        isActive 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-muted-foreground'
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
      {!isCollapsed && <span className="truncate">{item.title}</span>}
      {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="ml-auto flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
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

interface NavGroupComponentProps {
  group: NavGroup;
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
}

const NavGroupComponent = memo(function NavGroupComponent({
  group,
  isCollapsed,
  isOpen,
  onToggle,
  currentPath,
}: NavGroupComponentProps) {
  const Icon = group.icon;
  const hasActiveItem = group.items.some(item => currentPath === item.href);

  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {group.items.map((item) => (
          <NavItemComponent
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            isActive={currentPath === item.href}
          />
        ))}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent/50',
            hasActiveItem ? 'text-primary' : 'text-foreground'
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className={cn("h-4 w-4", hasActiveItem && "text-primary")} />
            <span>{group.title}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 pt-1 space-y-0.5">
        {group.items.map((item) => (
          <NavItemComponent
            key={item.href}
            item={item}
            isCollapsed={false}
            isActive={currentPath === item.href}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

function AppSidebarComponent({ isCollapsed = false, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  // Track which groups are open
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Open the group containing the current route by default
    const initial: Record<string, boolean> = {};
    navigationGroups.forEach((group) => {
      const hasActiveItem = group.items.some(
        (item) => location.pathname === item.href
      );
      initial[group.id] = hasActiveItem;
    });
    return initial;
  });

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r bg-sidebar transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Sentinela</span>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Shield className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-2 px-2">
          {navigationGroups.map((group) => (
            <NavGroupComponent
              key={group.id}
              group={group}
              isCollapsed={isCollapsed}
              isOpen={openGroups[group.id] ?? false}
              onToggle={() => toggleGroup(group.id)}
              currentPath={location.pathname}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                isCollapsed ? 'justify-center px-2' : 'justify-start'
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">{t('common.logout') || 'Sair'}</span>}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">Sair</TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );
}

export const AppSidebar = memo(AppSidebarComponent);