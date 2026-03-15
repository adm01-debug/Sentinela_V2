import { NavLink } from 'react-router-dom';
import {
  Home, Users, Activity, FileText, Bell, Settings, ChevronLeft, ChevronRight,
  BarChart3, Shield, Monitor, Camera, Globe, Calendar, Gamepad2, Wifi,
  Building2, UserCog, ScrollText, Smartphone, MapPin, Clock, Download,
  Key, Webhook, MessageSquare, Brain
} from 'lucide-react';
import { useUIStore } from '@/stores';
import { cn } from '@/utils/cn';
import { ROUTES, APP_NAME } from '@/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

interface NavSection {
  title: string;
  items: { icon: any; label: string; path: string }[];
}

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { icon: Home, label: 'Dashboard', path: ROUTES.DASHBOARD },
      { icon: Users, label: 'Funcionários', path: ROUTES.EMPLOYEES },
      { icon: Activity, label: 'Atividades', path: ROUTES.ACTIVITIES },
      { icon: Monitor, label: 'Monitoramento', path: '/monitoring' },
    ],
  },
  {
    title: 'Segurança',
    items: [
      { icon: Shield, label: 'Violações', path: '/violations' },
      { icon: Bell, label: 'Alertas', path: ROUTES.ALERTS },
      { icon: Camera, label: 'Screenshots', path: ROUTES.SCREENSHOTS },
      { icon: Globe, label: 'Acesso Internet', path: '/internet-access' },
    ],
  },
  {
    title: 'Análises',
    items: [
      { icon: BarChart3, label: 'Analytics', path: ROUTES.ANALYTICS },
      { icon: FileText, label: 'Relatórios', path: ROUTES.REPORTS },
      { icon: Brain, label: 'Análise IA', path: '/ai-analysis' },
    ],
  },
  {
    title: 'Dispositivos',
    items: [
      { icon: Smartphone, label: 'Dispositivos', path: '/devices' },
      { icon: MapPin, label: 'Geofencing', path: '/geofencing' },
    ],
  },
  {
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
    title: 'Integrações',
    items: [
      { icon: Webhook, label: 'Integrações', path: '/integrations' },
      { icon: Webhook, label: 'Webhooks', path: '/integrations/webhooks' },
      { icon: MessageSquare, label: 'WhatsApp', path: '/integrations/whatsapp' },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { icon: Settings, label: 'Configurações', path: ROUTES.SETTINGS },
      { icon: Key, label: 'Chaves API', path: ROUTES.SETTINGS_API },
    ],
  },
];

export const AppSidebar = () => {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();

  return (
    <aside className={cn('fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-40 flex flex-col', sidebarCollapsed ? 'w-16' : 'w-64')}>
      <div className="h-14 flex items-center justify-between px-4 border-b shrink-0">
        {!sidebarCollapsed && <span className="font-bold text-lg text-primary">{APP_NAME}</span>}
        <button onClick={toggleSidebarCollapse} className="p-1 rounded-md hover:bg-muted transition-colors">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed && (
                <div className="px-3 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {section.title}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-1.5 rounded-md transition-colors text-sm',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
};
