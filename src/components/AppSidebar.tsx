import { useState, useCallback, memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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

interface NavSection {
  id: string;
  title: string;
  defaultOpen?: boolean;
  items: { icon: any; label: string; path: string }[];
}

const navSections: NavSection[] = [
  {
    id: 'main',
    title: 'Principal',
    defaultOpen: true,
    items: [
      { icon: Home, label: 'Dashboard', path: ROUTES.DASHBOARD },
      { icon: Users, label: 'Funcionários', path: ROUTES.EMPLOYEES },
      { icon: Activity, label: 'Atividades', path: ROUTES.ACTIVITIES },
      { icon: Monitor, label: 'Monitoramento', path: '/monitoring' },
    ],
  },
  {
    id: 'time',
    title: 'Ponto & Horas',
    items: [
      { icon: Timer, label: 'Ponto Digital', path: '/time-clock' },
      { icon: FolderKanban, label: 'Projetos & Tarefas', path: '/projects' },
      { icon: ClipboardList, label: 'Folhas de Ponto', path: '/timesheets' },
      { icon: UserCheck, label: 'Assiduidade', path: '/attendance' },
      { icon: BarChart, label: 'Tracking de Horas', path: '/hours-tracking' },
    ],
  },
  {
    id: 'security',
    title: 'Segurança',
    items: [
      { icon: Shield, label: 'Violações', path: '/violations' },
      { icon: Bell, label: 'Alertas', path: ROUTES.ALERTS },
      { icon: Camera, label: 'Screenshots', path: ROUTES.SCREENSHOTS },
      { icon: Globe, label: 'Acesso Internet', path: '/internet-access' },
    ],
  },
  {
    id: 'analytics',
    title: 'Análises',
    items: [
      { icon: BarChart3, label: 'Analytics', path: ROUTES.ANALYTICS },
      { icon: FileText, label: 'Relatórios', path: ROUTES.REPORTS },
      { icon: Brain, label: 'Análise IA', path: '/ai-analysis' },
    ],
  },
  {
    id: 'devices',
    title: 'Dispositivos',
    items: [
      { icon: Smartphone, label: 'Dispositivos', path: '/devices' },
      { icon: MapPin, label: 'Geofencing', path: '/geofencing' },
    ],
  },
  {
    id: 'org',
    title: 'Organização',
    items: [
      { icon: Building2, label: 'Departamentos', path: ROUTES.ADMIN_DEPARTMENTS },
      { icon: Users, label: 'Equipes', path: ROUTES.ADMIN_TEAMS },
      { icon: Calendar, label: 'Calendário', path: '/calendar' },
      { icon: Clock, label: 'Horários', path: '/work-schedules' },
      { icon: Gamepad2, label: 'Gamificação', path: '/gamification' },
    ],
  },
  {
    id: 'admin',
    title: 'Administração',
    items: [
      { icon: UserCog, label: 'Usuários', path: ROUTES.ADMIN_USERS },
      { icon: Shield, label: 'Papéis', path: ROUTES.ADMIN_ROLES },
      { icon: ScrollText, label: 'Auditoria', path: ROUTES.ADMIN_AUDIT },
      { icon: Shield, label: 'Compliance', path: '/compliance' },
      { icon: Download, label: 'Exportação', path: '/export' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrações',
    items: [
      { icon: Webhook, label: 'Integrações', path: '/integrations' },
      { icon: Webhook, label: 'Webhooks', path: '/integrations/webhooks' },
      { icon: MessageSquare, label: 'WhatsApp', path: '/integrations/whatsapp' },
    ],
  },
  {
    id: 'settings',
    title: 'Configurações',
    items: [
      { icon: Settings, label: 'Configurações', path: ROUTES.SETTINGS },
      { icon: Key, label: 'Chaves API', path: ROUTES.SETTINGS_API },
    ],
  },
];

export const AppSidebar = memo(function AppSidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const location = useLocation();

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
              aria-label="Recolher sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1" aria-label="Navegação principal">
            {navSections.map((section) => {
              const isOpen = openSections.has(section.id);
              const hasActiveItem = section.items.some(item =>
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              );

              return (
                <div key={section.id}>
                  {/* Section header (clickable to toggle) */}
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
                      <span>{section.title}</span>
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

                  {/* Section items */}
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
                              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                            </NavLink>
                          );

                          if (sidebarCollapsed) {
                            return (
                              <Tooltip key={item.path}>
                                <TooltipTrigger asChild>
                                  {linkContent}
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
                                  {item.label}
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
