import { memo, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Monitor,
  FileText,
  Map,
  Search,
  Moon,
  Sun,
  LogOut,
  Bell,
  Key,
  Clock,
  BarChart3,
  Laptop,
  MapPin,
  Calendar,
  Activity,
  Zap,
  HelpCircle,
  UserPlus,
  FilePlus,
  ShieldPlus,
  Plus,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useCommandPaletteShortcut } from '@/hooks/useKeyboardShortcut';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
  group: 'navigation' | 'actions' | 'create' | 'settings';
  shortcut?: string;
}

// ============================================================
// COMPONENT
// ============================================================

function CommandPaletteComponent() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();

  // Open with Ctrl/Cmd + K
  useCommandPaletteShortcut(() => setOpen(true));

  // Navigation items - expanded
  const navigationItems: CommandItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        title: 'Dashboard',
        description: 'Visão geral do sistema',
        icon: LayoutDashboard,
        action: () => navigate('/'),
        keywords: ['home', 'início', 'painel', 'overview'],
        group: 'navigation',
        shortcut: '⌘1',
      },
      {
        id: 'employees',
        title: 'Funcionários',
        description: 'Gerenciar equipe',
        icon: Users,
        action: () => navigate('/employees'),
        keywords: ['colaboradores', 'pessoas', 'equipe', 'team'],
        group: 'navigation',
        shortcut: '⌘2',
      },
      {
        id: 'monitoring',
        title: 'Monitoramento',
        description: 'Atividade em tempo real',
        icon: Monitor,
        action: () => navigate('/monitoring'),
        keywords: ['rastrear', 'acompanhar', 'live', 'realtime'],
        group: 'navigation',
        shortcut: '⌘3',
      },
      {
        id: 'violations',
        title: 'Violações',
        description: 'Alertas de segurança',
        icon: Shield,
        action: () => navigate('/violations'),
        keywords: ['alertas', 'infrações', 'segurança', 'security'],
        group: 'navigation',
      },
      {
        id: 'reports',
        title: 'Relatórios',
        description: 'Análises e exportações',
        icon: FileText,
        action: () => navigate('/reports'),
        keywords: ['análise', 'dados', 'exportar', 'analytics'],
        group: 'navigation',
      },
      {
        id: 'geofencing',
        title: 'Geofencing',
        description: 'Áreas geográficas',
        icon: MapPin,
        action: () => navigate('/geofencing'),
        keywords: ['localização', 'mapa', 'área', 'location'],
        group: 'navigation',
      },
      {
        id: 'devices',
        title: 'Dispositivos',
        description: 'Computadores monitorados',
        icon: Laptop,
        action: () => navigate('/devices'),
        keywords: ['computador', 'pc', 'máquina', 'computer'],
        group: 'navigation',
      },
      {
        id: 'timeline',
        title: 'Timeline',
        description: 'Histórico de sessões',
        icon: Clock,
        action: () => navigate('/timeline'),
        keywords: ['histórico', 'sessão', 'gravação', 'history'],
        group: 'navigation',
      },
      {
        id: 'productivity',
        title: 'Produtividade',
        description: 'Análise de desempenho',
        icon: BarChart3,
        action: () => navigate('/productivity-comparison'),
        keywords: ['performance', 'desempenho', 'eficiência'],
        group: 'navigation',
      },
      {
        id: 'schedules',
        title: 'Horários',
        description: 'Jornadas de trabalho',
        icon: Calendar,
        action: () => navigate('/schedules'),
        keywords: ['agenda', 'jornada', 'turno', 'schedule'],
        group: 'navigation',
      },
      {
        id: 'settings',
        title: 'Configurações',
        description: 'Preferências do sistema',
        icon: Settings,
        action: () => navigate('/settings'),
        keywords: ['preferências', 'conta', 'opções', 'config'],
        group: 'navigation',
        shortcut: '⌘,',
      },
    ],
    [navigate]
  );

  // Create actions
  const createItems: CommandItem[] = useMemo(
    () => [
      {
        id: 'create-employee',
        title: 'Novo Funcionário',
        description: 'Adicionar à equipe',
        icon: UserPlus,
        action: () => navigate('/employees/create'),
        keywords: ['adicionar', 'criar', 'novo', 'add'],
        group: 'create',
      },
      {
        id: 'create-policy',
        title: 'Nova Política',
        description: 'Criar regra de segurança',
        icon: ShieldPlus,
        action: () => navigate('/policies/create'),
        keywords: ['política', 'regra', 'security'],
        group: 'create',
      },
      {
        id: 'create-geofence',
        title: 'Novo Geofence',
        description: 'Definir área permitida',
        icon: Map,
        action: () => navigate('/geofences/create'),
        keywords: ['geofence', 'área', 'location'],
        group: 'create',
      },
      {
        id: 'create-report',
        title: 'Novo Relatório',
        description: 'Gerar análise personalizada',
        icon: FilePlus,
        action: () => navigate('/report-builder'),
        keywords: ['relatório', 'report', 'análise'],
        group: 'create',
      },
    ],
    [navigate]
  );

  // Action items
  const actionItems: CommandItem[] = useMemo(
    () => [
      {
        id: 'toggle-theme',
        title: theme === 'dark' ? 'Modo Claro' : 'Modo Escuro',
        description: 'Alternar tema',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        keywords: ['tema', 'aparência', 'dark', 'light', 'escuro', 'claro'],
        group: 'settings',
      },
      {
        id: 'notifications',
        title: 'Notificações',
        description: 'Configurar alertas',
        icon: Bell,
        action: () => navigate('/settings/notifications'),
        keywords: ['alerta', 'aviso', 'notification'],
        group: 'settings',
      },
      {
        id: 'agent-keys',
        title: 'Chaves de Agente',
        description: 'Gerenciar instalações',
        icon: Key,
        action: () => navigate('/agent-keys'),
        keywords: ['key', 'chave', 'instalação', 'agent'],
        group: 'settings',
      },
      {
        id: 'help',
        title: 'Ajuda',
        description: 'Documentação e suporte',
        icon: HelpCircle,
        action: () => navigate('/help'),
        keywords: ['ajuda', 'suporte', 'documentação', 'help', 'support'],
        group: 'settings',
      },
      {
        id: 'logout',
        title: 'Sair',
        description: 'Encerrar sessão',
        icon: LogOut,
        action: () => signOut(),
        keywords: ['logout', 'desconectar', 'encerrar', 'sair'],
        group: 'settings',
      },
    ],
    [theme, setTheme, signOut, navigate]
  );

  const allItems = useMemo(
    () => [...navigationItems, ...createItems, ...actionItems],
    [navigationItems, createItems, actionItems]
  );

  const handleSelect = useCallback(
    (itemId: string) => {
      const item = allItems.find((i) => i.id === itemId);
      if (item) {
        item.action();
        setOpen(false);
      }
    },
    [allItems]
  );

  return (
    <>
      {/* Search trigger button - enhanced */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-3 py-2',
          'bg-muted/50 hover:bg-muted border border-transparent hover:border-border',
          'text-sm text-muted-foreground transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command dialog - enhanced */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar páginas, ações, criar..." />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Tente buscar por outra palavra-chave.</p>
            </div>
          </CommandEmpty>

          <CommandGroup heading="Criar">
            {createItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={handleSelect}
                  keywords={item.keywords}
                  className="gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    {Icon && <Icon className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                  <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navegação">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={handleSelect}
                  keywords={item.keywords}
                  className="gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    {Icon && <Icon className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                  {item.shortcut && (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Ações">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={handleSelect}
                  keywords={item.keywords}
                  className="gap-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    {Icon && <Icon className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export const CommandPalette = memo(CommandPaletteComponent);
