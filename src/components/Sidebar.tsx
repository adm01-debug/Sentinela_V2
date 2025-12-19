import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users,
  Monitor,
  AlertTriangle,
  Settings,
  Shield,
  FileText,
  MapPin,
  Clock,
  Key,
  Webhook,
  MessageSquare,
  Calendar,
  Download,
  Brain,
  Globe,
  Search,
  FileCheck,
  UserCheck,
  Activity,
  BarChart3,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Trophy,
  UsersRound,
} from 'lucide-react';

// ============================================================
// NAVIGATION ITEMS
// ============================================================

const navigationItems = [
  {
    title: 'Principal',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Funcionários', href: '/employees', icon: Users },
      { name: 'Equipes', href: '/teams', icon: UsersRound },
      { name: 'Dispositivos', href: '/devices', icon: Monitor },
      { name: 'Gamificação', href: '/gamification', icon: Trophy },
    ],
  },
  {
    title: 'Monitoramento',
    items: [
      { name: 'Atividade', href: '/monitoring', icon: Activity },
      { name: 'Mobile', href: '/mobile-monitoring', icon: Smartphone },
      { name: 'Violações', href: '/violations', icon: AlertTriangle },
      { name: 'Regras', href: '/violation-rules', icon: Shield },
      { name: 'Segurança', href: '/security', icon: Shield },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { name: 'Geofencing', href: '/geofencing', icon: MapPin },
      { name: 'Horários', href: '/work-schedules', icon: Clock },
      { name: 'Chaves API', href: '/agent-keys', icon: Key },
      { name: 'Webhooks', href: '/webhooks', icon: Webhook },
      { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
      { name: 'Templates', href: '/message-templates', icon: FileText },
    ],
  },
  {
    title: 'Relatórios',
    items: [
      { name: 'Relatórios', href: '/reports', icon: FileText },
      { name: 'Agendados', href: '/scheduled-reports', icon: Calendar },
      { name: 'Exportar', href: '/data-export', icon: Download },
      { name: 'IA', href: '/ai-analysis', icon: Brain },
      { name: 'Comparativo', href: '/productivity-comparison', icon: BarChart3 },
    ],
  },
  {
    title: 'Políticas',
    items: [
      { name: 'Internet', href: '/internet-access', icon: Globe },
      { name: 'Palavras', href: '/sensitive-keywords', icon: Search },
      { name: 'Políticas', href: '/monitoring-policies', icon: FileCheck },
      { name: 'Aceites', href: '/policy-acknowledgments', icon: UserCheck },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { name: 'Usuários', href: '/user-management', icon: Users },
      { name: 'Rate Limit', href: '/rate-limit-dashboard', icon: Activity },
      { name: 'Configurações', href: '/settings', icon: Settings },
    ],
  },
];

// ============================================================
// SIDEBAR COMPONENT
// ============================================================

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Flatten items for keyboard navigation
  const allItems = navigationItems.flatMap(group => group.items);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(Math.min(index + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(Math.max(index - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(allItems.length - 1);
        break;
    }
  }, [allItems.length]);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  let itemIndex = 0;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <Link 
            to="/" 
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded"
            aria-label="Ir para o Dashboard"
          >
            <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="font-bold text-lg">Sentinela</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="ml-auto"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav 
          className="p-2 space-y-4"
          role="menubar"
          aria-label="Navegação do sistema"
        >
          {navigationItems.map((group, groupIndex) => (
            <div key={group.title} role="group" aria-labelledby={`nav-group-${groupIndex}`}>
              {!collapsed && (
                <h3 
                  id={`nav-group-${groupIndex}`}
                  className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                >
                  {group.title}
                </h3>
              )}
              <ul role="menu" className="space-y-1">
                {group.items.map((item) => {
                  const currentIndex = itemIndex++;
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  const linkContent = (
                    <Link
                      to={item.href}
                      role="menuitem"
                      tabIndex={focusedIndex === currentIndex ? 0 : -1}
                      aria-current={isActive ? 'page' : undefined}
                      onKeyDown={(e) => handleKeyDown(e, currentIndex)}
                      onFocus={() => setFocusedIndex(currentIndex)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                        'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                        collapsed && 'justify-center'
                      )}
                    >
                      <Icon 
                        className="h-4 w-4 flex-shrink-0" 
                        aria-hidden="true"
                      />
                      {!collapsed && (
                        <span>{item.name}</span>
                      )}
                      {/* Screen reader only text when collapsed */}
                      {collapsed && (
                        <span className="sr-only">{item.name}</span>
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.href} role="none">
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {linkContent}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        linkContent
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
