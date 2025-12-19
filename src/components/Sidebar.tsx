import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings, 
  Bell, 
  Monitor,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  LogOut,
  Eye,
  Key,
  ShieldAlert,
  Globe,
  Brain,
  ClipboardCheck,
  FileSearch,
  Building2,
  Clock,
  MapPin,
  Smartphone,
  Mail,
  GitCompare,
  Archive,
  ShieldCheck,
  Webhook
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePendingNotifications } from '@/hooks/usePendingNotifications';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Building2, label: 'Equipes', path: '/teams' },
  { icon: Users, label: 'Colaboradores', path: '/employees' },
  { icon: Clock, label: 'Jornadas', path: '/work-schedules', badgeKey: 'overtimeRequests' as const },
  { icon: MapPin, label: 'Geofencing', path: '/geofencing' },
  { icon: Monitor, label: 'Dispositivos', path: '/devices' },
  { icon: Eye, label: 'Monitoramento', path: '/monitoring' },
  { icon: Key, label: 'Chaves de Agentes', path: '/agent-keys' },
  { icon: Shield, label: 'Segurança', path: '/security' },
  { icon: Bell, label: 'Violações', path: '/violations', badgeKey: 'unreadViolations' as const },
  { icon: ShieldAlert, label: 'Regras de Violação', path: '/violation-rules' },
  { icon: FileSearch, label: 'Palavras Sensíveis', path: '/sensitive-keywords' },
  { icon: Globe, label: 'Acesso Internet', path: '/internet-access' },
  { icon: ClipboardCheck, label: 'Aceites de Políticas', path: '/policy-acknowledgments' },
  { icon: Smartphone, label: 'Mobile', path: '/mobile-monitoring' },
  { icon: Brain, label: 'Análise IA', path: '/ai-analysis' },
  { icon: FileBarChart, label: 'Relatórios', path: '/reports' },
  { icon: GitCompare, label: 'Comparativo', path: '/productivity-comparison' },
  { icon: Mail, label: 'Relatórios Agendados', path: '/scheduled-reports' },
  { icon: Archive, label: 'Exportar Dados', path: '/data-export' },
  { icon: ShieldCheck, label: 'Rate Limiting', path: '/rate-limiting' },
  { icon: Webhook, label: 'Webhooks', path: '/webhooks' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { counts } = usePendingNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getBadgeCount = (badgeKey?: 'overtimeRequests' | 'unreadViolations') => {
    if (!badgeKey) return 0;
    return counts[badgeKey] || 0;
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <NotificationsDropdown collapsed={collapsed} />
            <span className="font-bold text-lg cursor-pointer" onClick={() => navigate('/')}>SecureWatch</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <NotificationsDropdown collapsed={collapsed} />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-lg p-2 hover:bg-accent transition-colors",
            collapsed && "mx-auto mt-2"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const badgeCount = getBadgeCount(item.badgeKey);
          
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5 shrink-0" />
                {badgeCount > 0 && collapsed && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <>
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold animate-pulse",
                      isActive 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "bg-destructive text-destructive-foreground"
                    )}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {!collapsed && user && (
          <p className="text-xs text-muted-foreground truncate mb-2 px-3">
            {user.email}
          </p>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
