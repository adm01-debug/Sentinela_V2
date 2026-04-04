import { memo, useCallback, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
// prefetch removed - using native browser prefetching
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  Activity,
  Briefcase,
  Zap,
  Lock,
  Send,
  Download,
  Eye,
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

interface NavGroup {
  id: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navigationGroups: NavGroup[] = [
  {
    id: 'overview',
    labelKey: 'Dashboard',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { titleKey: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    id: 'people',
    labelKey: 'Pessoas',
    icon: Users,
    defaultOpen: true,
    items: [
      { titleKey: 'Funcionários', href: '/employees', icon: Users },
      { titleKey: 'Equipes', href: '/teams', icon: Briefcase },
      { titleKey: 'Gamificação', href: '/gamification', icon: Award },
    ],
  },
  {
    id: 'monitoring',
    labelKey: 'Monitoramento',
    icon: Eye,
    defaultOpen: true,
    items: [
      { titleKey: 'Atividades', href: '/monitoring', icon: Activity },
      { titleKey: 'Mobile', href: '/mobile-monitoring', icon: Smartphone },
      { titleKey: 'Dispositivos', href: '/devices', icon: Monitor },
      { titleKey: 'Produtividade', href: '/productivity-comparison', icon: BarChart3 },
      { titleKey: 'Análise IA', href: '/ai-analysis', icon: Brain },
    ],
  },
  {
    id: 'security',
    labelKey: 'Segurança',
    icon: Shield,
    items: [
      { titleKey: 'Violações', href: '/violations', icon: AlertTriangle },
      { titleKey: 'Regras', href: '/violation-rules', icon: Shield },
      { titleKey: 'Políticas', href: '/monitoring-policies', icon: ClipboardCheck },
      { titleKey: 'Aceites', href: '/policy-acknowledgments', icon: ClipboardCheck },
      { titleKey: 'Palavras-chave', href: '/sensitive-keywords', icon: FileSearch },
      { titleKey: 'Rate Limit', href: '/rate-limit-dashboard', icon: Lock },
      { titleKey: 'Central', href: '/security', icon: Shield },
    ],
  },
  {
    id: 'location',
    labelKey: 'Localização',
    icon: Map,
    items: [
      { titleKey: 'Geofencing', href: '/geofencing', icon: Map },
      { titleKey: 'Horários', href: '/work-schedules', icon: Calendar },
      { titleKey: 'Internet', href: '/internet-access', icon: Globe },
    ],
  },
  {
    id: 'reports',
    labelKey: 'Relatórios',
    icon: FileText,
    items: [
      { titleKey: 'Relatórios', href: '/reports', icon: FileText },
      { titleKey: 'Agendados', href: '/scheduled-reports', icon: Clock },
      { titleKey: 'Exportar', href: '/data-export', icon: Download },
    ],
  },
  {
    id: 'integrations',
    labelKey: 'Integrações',
    icon: Zap,
    items: [
      { titleKey: 'Agent Keys', href: '/agent-keys', icon: Key },
      { titleKey: 'Webhooks', href: '/webhooks', icon: Webhook },
      { titleKey: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
      { titleKey: 'Templates', href: '/message-templates', icon: Send },
    ],
  },
  {
    id: 'admin',
    labelKey: 'Administração',
    icon: Settings,
    items: [
      { titleKey: 'Usuários', href: '/user-management', icon: UserCog },
      { titleKey: 'Configurações', href: '/settings', icon: Settings },
    ],
  },
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

  const handleMouseEnter = useCallback(() => {
    // Route prefetching handled by React lazy loading
  }, [item.href]);

  const content = (
    <NavLink
      to={item.href}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
        'hover:bg-accent/80 hover:translate-x-0.5',
        isActive 
          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
      {!isCollapsed && <span className="truncate">{item.titleKey}</span>}
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
          {item.titleKey}
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
  activeHref: string;
}

const NavGroupComponent = memo(function NavGroupComponent({
  group,
  isCollapsed,
  isOpen,
  onToggle,
  activeHref,
}: NavGroupComponentProps) {
  const Icon = group.icon;
  const hasActiveItem = group.items.some(item => item.href === activeHref);

  if (group.items.length === 1) {
    return (
      <NavItemComponent
        item={group.items[0]}
        isCollapsed={isCollapsed}
        isActive={activeHref === group.items[0].href}
      />
    );
  }

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'flex w-full items-center justify-center rounded-lg p-2 transition-all duration-200',
              hasActiveItem 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-0">
          <div className="min-w-[160px] p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {group.labelKey}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  activeHref === item.href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-accent'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.titleKey}
              </NavLink>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          hasActiveItem 
            ? 'text-primary' 
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn('h-4 w-4', hasActiveItem && 'text-primary')} />
          <span>{group.labelKey}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 space-y-0.5 border-l border-border/50 pl-2">
              {group.items.map((item) => (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  isCollapsed={false}
                  isActive={activeHref === item.href}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

function SidebarComponent() {
  const location = useLocation();
  const { logout } = useAuth();
  const { isCollapsed, toggle } = useSidebarStore();
  
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    navigationGroups.forEach(group => {
      if (group.defaultOpen || group.items.some(item => item.href === location.pathname)) {
        initial.add(group.id);
      }
    });
    return initial;
  });

  const handleSignOut = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleToggle = useCallback(() => {
    toggle();
  }, [toggle]);

  const toggleGroup = useCallback((groupId) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background/95 backdrop-blur-sm',
        'shadow-lg'
      )}
    >
      <div className={cn(
        'flex h-16 items-center border-b px-4',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Sentinela</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Enterprise Security</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleToggle}
          className={cn(
            'h-8 w-8 rounded-full',
            isCollapsed && 'absolute -right-3 top-6 bg-background border shadow-sm'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-2 px-3">
          {navigationGroups.map((group) => (
            <NavGroupComponent
              key={group.id}
              group={group}
              isCollapsed={isCollapsed}
              isOpen={openGroups.has(group.id)}
              onToggle={() => toggleGroup(group.id)}
              activeHref={location.pathname}
            />
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                isCollapsed ? 'justify-center px-2' : 'justify-start'
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sair</span>}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">Sair</TooltipContent>
          )}
        </Tooltip>
      </div>
    </motion.div>
  );
}

export const Sidebar = memo(SidebarComponent);
