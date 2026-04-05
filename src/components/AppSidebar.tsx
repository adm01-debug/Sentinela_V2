import { useState, useCallback, memo, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home, Users, Activity, FileText, Bell, Settings, ChevronLeft,
  BarChart3, Shield, Monitor, Camera, Globe, Calendar, Gamepad2,
  Building2, UserCog, ScrollText, Smartphone, MapPin, Clock, Download,
  Key, Webhook, MessageSquare, Brain, FolderKanban, Timer, ClipboardList,
  UserCheck, BarChart, ChevronDown, LogOut, Link2, ShieldCheck, FileCheck
} from 'lucide-react';
import { useUIStore } from '@/stores';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import { ROUTES, APP_NAME } from '@/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  path: string;
}

interface NavSection {
  id: string;
  titleKey: string;
  defaultOpen?: boolean;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    id: 'main',
    titleKey: 'sections.main',
    defaultOpen: true,
    items: [
      { icon: Home, labelKey: 'nav.dashboard', path: ROUTES.DASHBOARD },
      { icon: Users, labelKey: 'nav.employees', path: ROUTES.EMPLOYEES },
      { icon: Activity, labelKey: 'nav.activities', path: ROUTES.ACTIVITIES },
      { icon: Monitor, labelKey: 'nav.monitoring', path: '/monitoring' },
    ],
  },
  {
    id: 'time',
    titleKey: 'sections.timeHours',
    items: [
      { icon: Timer, labelKey: 'nav.timeClock', path: '/time-clock' },
      { icon: FolderKanban, labelKey: 'nav.projects', path: '/projects' },
      { icon: ClipboardList, labelKey: 'nav.timesheets', path: '/timesheets' },
      { icon: UserCheck, labelKey: 'nav.attendance', path: '/attendance' },
      { icon: BarChart, labelKey: 'nav.hoursTracking', path: '/hours-tracking' },
    ],
  },
  {
    id: 'security',
    titleKey: 'sections.security',
    items: [
      { icon: Shield, labelKey: 'nav.violations', path: '/violations' },
      { icon: Bell, labelKey: 'nav.alerts', path: ROUTES.ALERTS },
      { icon: Camera, labelKey: 'nav.screenshots', path: ROUTES.SCREENSHOTS },
      { icon: Globe, labelKey: 'nav.internetAccess', path: '/internet-access' },
    ],
  },
  {
    id: 'analytics',
    titleKey: 'sections.analytics',
    items: [
      { icon: BarChart3, labelKey: 'nav.analytics', path: ROUTES.ANALYTICS },
      { icon: FileText, labelKey: 'nav.reports', path: ROUTES.REPORTS },
      { icon: Brain, labelKey: 'nav.aiAnalysis', path: '/ai-analysis' },
    ],
  },
  {
    id: 'devices',
    titleKey: 'sections.devices',
    items: [
      { icon: Smartphone, labelKey: 'nav.devices', path: '/devices' },
      { icon: MapPin, labelKey: 'nav.geofencing', path: '/geofencing' },
    ],
  },
  {
    id: 'org',
    titleKey: 'sections.organization',
    items: [
      { icon: Building2, labelKey: 'nav.departments', path: ROUTES.ADMIN_DEPARTMENTS },
      { icon: Users, labelKey: 'nav.teams', path: ROUTES.ADMIN_TEAMS },
      { icon: Calendar, labelKey: 'nav.calendar', path: '/calendar' },
      { icon: Clock, labelKey: 'nav.workSchedules', path: '/work-schedules' },
      { icon: Gamepad2, labelKey: 'nav.gamification', path: '/gamification' },
    ],
  },
  {
    id: 'admin',
    titleKey: 'sections.admin',
    items: [
      { icon: UserCog, labelKey: 'nav.users', path: ROUTES.ADMIN_USERS },
      { icon: ShieldCheck, labelKey: 'nav.roles', path: ROUTES.ADMIN_ROLES },
      { icon: ScrollText, labelKey: 'nav.audit', path: ROUTES.ADMIN_AUDIT },
      { icon: FileCheck, labelKey: 'nav.compliance', path: '/compliance' },
      { icon: Download, labelKey: 'nav.exportData', path: '/export' },
    ],
  },
  {
    id: 'integrations',
    titleKey: 'sections.integrations',
    items: [
      { icon: Link2, labelKey: 'nav.integrations', path: '/integrations' },
      { icon: Webhook, labelKey: 'nav.webhooks', path: '/integrations/webhooks' },
      { icon: MessageSquare, labelKey: 'nav.whatsapp', path: '/integrations/whatsapp' },
    ],
  },
  {
    id: 'settings',
    titleKey: 'sections.settings',
    items: [
      { icon: Settings, labelKey: 'nav.settings', path: ROUTES.SETTINGS },
      { icon: Key, labelKey: 'nav.apiKeys', path: ROUTES.SETTINGS_API },
    ],
  },
];

export const AppSidebar = memo(function AppSidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const displayName = useMemo(() => {
    if (!user) return 'Usuário';
    return user.name || user.email?.split('@')[0] || 'Usuário';
  }, [user]);

  const displayEmail = user?.email || '';

  const initials = useMemo(() => {
    if (!displayName || displayName === 'Usuário') return 'U';
    return displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }, [displayName]);

  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    navSections.forEach(section => {
      if (section.defaultOpen || section.items.some(item => location.pathname.startsWith(item.path))) {
        initial.add(section.id);
      }
    });
    return initial;
  });

  const toggleSection = useCallback((id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300',
          'bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]',
          sidebarCollapsed ? 'w-[60px]' : 'w-[252px]'
        )}
      >
        {/* ── Brand Header ── */}
        <div className="h-14 flex items-center justify-between px-3 shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--sidebar-primary))] to-[hsl(var(--accent))]">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-[15px] text-[hsl(var(--sidebar-accent-foreground))] tracking-tight">
                {APP_NAME}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--sidebar-primary))] to-[hsl(var(--accent))] mx-auto">
              <Shield className="h-4 w-4 text-white" />
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebarCollapse}
              className="p-1 rounded-md text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
              aria-label={t('header.collapseSidebar')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="mx-3 border-t border-[hsl(var(--sidebar-border))]" />

        {/* ── Navigation ── */}
        <ScrollArea className="flex-1 py-2">
          <nav className="px-2 space-y-0.5" aria-label={t('header.mainNavigation')}>
            {navSections.map((section, sectionIndex) => {
              const isOpen = openSections.has(section.id);
              const hasActiveItem = section.items.some(item =>
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              );

              return (
                <div key={section.id} className={sectionIndex > 0 ? 'mt-1' : ''}>
                  {/* ── Section Header ── */}
                  {!sidebarCollapsed ? (
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={cn(
                        'flex w-full items-center justify-between px-2 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors',
                        hasActiveItem
                          ? 'text-[hsl(var(--sidebar-primary))]'
                          : 'text-[hsl(var(--sidebar-group-label))] hover:text-[hsl(var(--sidebar-foreground))]'
                      )}
                    >
                      <span>{t(section.titleKey)}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </motion.div>
                    </button>
                  ) : (
                    sectionIndex > 0 && (
                      <div className="my-1.5 mx-2 border-t border-[hsl(var(--sidebar-border)/0.5)]" />
                    )
                  )}

                  {/* ── Section Items ── */}
                  <AnimatePresence initial={false}>
                    {(isOpen || sidebarCollapsed) && (
                      <motion.div
                        initial={sidebarCollapsed ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        {section.items.map((item) => {
                          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                          const label = t(item.labelKey);

                          const linkContent = (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              className={cn(
                                'flex items-center gap-2.5 px-2 py-[7px] rounded-md transition-all duration-150 text-[13px] group relative',
                                isActive
                                  ? 'bg-[hsl(var(--sidebar-primary)/0.15)] text-[hsl(var(--sidebar-primary))] font-medium'
                                  : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]'
                              )}
                            >
                              {/* Active indicator bar */}
                              {isActive && (
                                <motion.div
                                  layoutId="sidebar-active"
                                  className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-[hsl(var(--sidebar-primary))]"
                                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                              )}
                              <item.icon className={cn(
                                'h-[18px] w-[18px] shrink-0 transition-colors',
                                isActive ? 'text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-muted))] group-hover:text-[hsl(var(--sidebar-foreground))]'
                              )} />
                              {!sidebarCollapsed && (
                                <span className="truncate">{label}</span>
                              )}
                            </NavLink>
                          );

                          if (sidebarCollapsed) {
                            return (
                              <Tooltip key={item.path}>
                                <TooltipTrigger asChild>
                                  {linkContent}
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-medium text-xs">
                                  {label}
                                </TooltipContent>
                              </Tooltip>
                            );
                          }

                          return linkContent;
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* ── Footer ── */}
        <div className="shrink-0 px-3 py-2 border-t border-[hsl(var(--sidebar-border))]">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2 px-1 py-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--sidebar-primary))] to-[hsl(var(--accent))] flex items-center justify-center text-[10px] font-bold text-white">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[hsl(var(--sidebar-accent-foreground))] truncate">{displayName}</p>
                <p className="text-[10px] text-[hsl(var(--sidebar-muted))] truncate">{displayEmail}</p>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--sidebar-primary))] to-[hsl(var(--accent))] flex items-center justify-center text-[10px] font-bold text-white mx-auto cursor-pointer">
                  {initials}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">{displayName}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
});
