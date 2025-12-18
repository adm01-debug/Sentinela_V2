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
  FileSearch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Colaboradores', path: '/employees' },
  { icon: Monitor, label: 'Dispositivos', path: '/devices' },
  { icon: Eye, label: 'Monitoramento', path: '/monitoring' },
  { icon: Key, label: 'Chaves de Agentes', path: '/agent-keys' },
  { icon: Shield, label: 'Segurança', path: '/security' },
  { icon: Bell, label: 'Violações', path: '/violations' },
  { icon: ShieldAlert, label: 'Regras de Violação', path: '/violation-rules' },
  { icon: FileSearch, label: 'Palavras Sensíveis', path: '/sensitive-keywords' },
  { icon: Globe, label: 'Acesso Internet', path: '/internet-access' },
  { icon: ClipboardCheck, label: 'Aceites de Políticas', path: '/policy-acknowledgments' },
  { icon: Brain, label: 'Análise IA', path: '/ai-analysis' },
  { icon: FileBarChart, label: 'Relatórios', path: '/reports' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">SecureWatch</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 hover:bg-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      
      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
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
