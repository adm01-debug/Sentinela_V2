import { useState, useCallback, memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home, Users, Activity, FileText, Bell, Settings, ChevronLeft, ChevronRight,
  BarChart3, Shield, Monitor, Camera, Globe, Calendar, Gamepad2,
  Building2, UserCog, ScrollText, Smartphone, MapPin, Clock, Download,
  Key, Webhook, MessageSquare, Brain, FolderKanban, Timer, ClipboardList,
  UserCheck, BarChart, ChevronDown
} from 'lucide-react';
import { useUIStore } from '@/stores';
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
      { icon: Shield, labelKey: 'nav.roles', path: ROUTES.ADMIN_ROLES },
      { icon: ScrollText, labelKey: 'nav.audit', path: ROUTES.ADMIN_AUDIT },
      { icon: Shield, labelKey: 'nav.compliance', path: '/compliance' },
      { icon: Download, labelKey: 'nav.exportData', path: '/export' },
    ],
  },
  {
    id: 'integrations',
    titleKey: 'sections.integrations',
    items: [
      { icon: Webhook, labelKey: 'nav.integrations', path: '/integrations' },
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
  const location = useLocation();
  const { t } = useTranslation();

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
          'fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-40 flex flex-col',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">{APP_NAME}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm mx-auto">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebarCollapse}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              aria-label={t('header.collapseSidebar')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1" aria-label={t('header.mainNavigation')}>
            {navSections.map((section) => {
              const isOpen = openSections.has(section.id);
              const hasActiveItem = section.items.some(item =>
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              );

              return (
                <div key={section.id}>
                  {!sidebarCollapsed ? (
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors',
                        hasActiveItem
                          ? 'text-primary'
                          : 'text-muted-foreground/70 hover:text-muted-foreground'
                      )}
                    >
                      <span>{t(section.titleKey)}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </motion.div>
                    </button>
                  ) : (
                    <div className="my-2 mx-3 border-t border-border/50" />
                  )}

                  <AnimatePresence initial={false}>
                    {(isOpen || sidebarCollapsed) && (
                      <motion.div
                        initial={sidebarCollapsed ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden space-y-0.5"
                      >
                        {section.items.map((item) => {
                          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                          const label = t(item.labelKey);

                          const linkContent = (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              className={cn(
                                'flex items-center gap-3 px-3 py-1.5 rounded-md transition-all duration-200 text-sm group',
                                isActive
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              )}
                            >
                              <item.icon className={cn(
                                'h-4 w-4 shrink-0 transition-transform',
                                !isActive && 'group-hover:scale-110'
                              )} />
                              {!sidebarCollapsed && <span className="truncate">{label}</span>}
                            </NavLink>
                          );

                          if (sidebarCollapsed) {
                            return (
                              <Tooltip key={item.path}>
                                <TooltipTrigger asChild>
                                  {linkContent}
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
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
      </aside>
    </TooltipProvider>
  );
});
