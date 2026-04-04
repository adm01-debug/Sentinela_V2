import { memo, useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Shield, Settings, Monitor, FileText,
  Map, MessageSquare, Webhook, Calendar, Award, AlertTriangle,
  Globe, Key, BarChart3, Smartphone, Brain, UserCog, ClipboardCheck,
  LogOut, ChevronDown, Activity, Briefcase, Lock, Send, Download, Eye,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { titleKey: 'nav.dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    id: 'people',
    labelKey: 'sections.organization',
    icon: Users,
    defaultOpen: true,
    items: [
      { titleKey: 'nav.employees', href: '/employees', icon: Users },
      { titleKey: 'nav.teams', href: '/teams', icon: Briefcase },
      { titleKey: 'nav.gamification', href: '/gamification', icon: Award },
    ],
  },
  {
    id: 'monitoring',
    labelKey: 'nav.monitoring',
    icon: Eye,
    defaultOpen: true,
    items: [
      { titleKey: 'nav.activities', href: '/monitoring', icon: Activity },
      { titleKey: 'Mobile', href: '/mobile-monitoring', icon: Smartphone },
      { titleKey: 'nav.devices', href: '/devices', icon: Monitor },
      { titleKey: 'dashboard.productivity', href: '/productivity-comparison', icon: BarChart3 },
      { titleKey: 'nav.aiAnalysis', href: '/ai-analysis', icon: Brain },
    ],
  },
  {
    id: 'security',
    labelKey: 'sections.security',
    icon: Shield,
    items: [
      { titleKey: 'nav.violations', href: '/violations', icon: AlertTriangle },
      { titleKey: 'nav.roles', href: '/violation-rules', icon: Shield },
      { titleKey: 'nav.compliance', href: '/monitoring-policies', icon: ClipboardCheck },
      { titleKey: 'Rate Limit', href: '/rate-limit-dashboard', icon: Lock },
      { titleKey: 'sections.security', href: '/security', icon: Shield },
    ],
  },
  {
    id: 'location',
    labelKey: 'nav.geofencing',
    icon: Map,
    items: [
      { titleKey: 'nav.geofencing', href: '/geofencing', icon: Map },
      { titleKey: 'nav.workSchedules', href: '/work-schedules', icon: Calendar },
      { titleKey: 'nav.internetAccess', href: '/internet-access', icon: Globe },
    ],
  },
  {
    id: 'reports',
    labelKey: 'nav.reports',
    icon: FileText,
    items: [
      { titleKey: 'nav.reports', href: '/reports', icon: FileText },
      { titleKey: 'nav.exportData', href: '/data-export', icon: Download },
    ],
  },
  {
    id: 'integrations',
    labelKey: 'sections.integrations',
    icon: Webhook,
    items: [
      { titleKey: 'nav.apiKeys', href: '/agent-keys', icon: Key },
      { titleKey: 'nav.webhooks', href: '/webhooks', icon: Webhook },
      { titleKey: 'nav.whatsapp', href: '/whatsapp', icon: MessageSquare },
      { titleKey: 'Templates', href: '/message-templates', icon: Send },
    ],
  },
  {
    id: 'admin',
    labelKey: 'sections.admin',
    icon: Settings,
    items: [
      { titleKey: 'nav.users', href: '/user-management', icon: UserCog },
      { titleKey: 'nav.settings', href: '/settings', icon: Settings },
    ],
  },
];

interface MobileSidebarProps {
  onNavigate?: () => void;
}

function MobileSidebarComponent({ onNavigate }: MobileSidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useTranslation();
  
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
    onNavigate?.();
  }, [logout, onNavigate]);

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

  const handleNavClick = useCallback(() => {
    onNavigate?.();
  }, [onNavigate]);

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <SheetTitle className="text-lg font-bold tracking-tight">Sentinela</SheetTitle>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Enterprise Security</p>
          </div>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-2 px-3">
          {navigationGroups.map((group) => {
            const Icon = group.icon;
            const hasActiveItem = group.items.some(item => item.href === location.pathname);
            const isOpen = openGroups.has(group.id);

            if (group.items.length === 1) {
              const item = group.items[0];
              const ItemIcon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={group.id}
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                    'hover:bg-accent/80',
                    isActive 
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ItemIcon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
                  <span className="truncate">{t(item.titleKey)}</span>
                </NavLink>
              );
            }

            return (
              <div key={group.id} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    hasActiveItem 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('h-4 w-4', hasActiveItem && 'text-primary')} />
                    <span>{t(group.labelKey)}</span>
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
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = location.pathname === item.href;
                          
                          return (
                            <NavLink
                              key={item.href}
                              to={item.href}
                              onClick={handleNavClick}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                                'hover:bg-accent/80 hover:translate-x-0.5',
                                isActive 
                                  ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                                  : 'text-muted-foreground hover:text-foreground'
                              )}
                            >
                              <ItemIcon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
                              <span className="truncate">{t(item.titleKey)}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full gap-3 justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>{t('header.logout')}</span>
        </Button>
      </div>
    </div>
  );
}

export const MobileSidebar = memo(MobileSidebarComponent);
