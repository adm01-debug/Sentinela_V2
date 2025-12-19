import { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useCommandPaletteShortcut } from '@/hooks/useKeyboardShortcut';

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
  group: 'navigation' | 'actions' | 'settings';
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

  // Navigation items
  const navigationItems: CommandItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        action: () => navigate('/'),
        keywords: ['home', 'início', 'painel'],
        group: 'navigation',
      },
      {
        id: 'employees',
        title: 'Funcionários',
        icon: Users,
        action: () => navigate('/employees'),
        keywords: ['colaboradores', 'pessoas', 'equipe'],
        group: 'navigation',
      },
      {
        id: 'monitoring',
        title: 'Monitoramento',
        icon: Monitor,
        action: () => navigate('/monitoring'),
        keywords: ['rastrear', 'acompanhar'],
        group: 'navigation',
      },
      {
        id: 'violations',
        title: 'Violações',
        icon: Shield,
        action: () => navigate('/violations'),
        keywords: ['alertas', 'infrações', 'segurança'],
        group: 'navigation',
      },
      {
        id: 'reports',
        title: 'Relatórios',
        icon: FileText,
        action: () => navigate('/reports'),
        keywords: ['análise', 'dados', 'exportar'],
        group: 'navigation',
      },
      {
        id: 'geofencing',
        title: 'Geofencing',
        icon: Map,
        action: () => navigate('/geofencing'),
        keywords: ['localização', 'mapa', 'área'],
        group: 'navigation',
      },
      {
        id: 'settings',
        title: 'Configurações',
        icon: Settings,
        action: () => navigate('/settings'),
        keywords: ['preferências', 'conta', 'opções'],
        group: 'navigation',
      },
    ],
    [navigate]
  );

  // Action items
  const actionItems: CommandItem[] = useMemo(
    () => [
      {
        id: 'toggle-theme',
        title: theme === 'dark' ? 'Modo claro' : 'Modo escuro',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        keywords: ['tema', 'aparência', 'dark', 'light'],
        group: 'settings',
      },
      {
        id: 'logout',
        title: 'Sair',
        icon: LogOut,
        action: () => signOut(),
        keywords: ['logout', 'desconectar', 'encerrar'],
        group: 'settings',
      },
    ],
    [theme, setTheme, signOut]
  );

  const allItems = useMemo(
    () => [...navigationItems, ...actionItems],
    [navigationItems, actionItems]
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
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar páginas, ações..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          <CommandGroup heading="Navegação">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={handleSelect}
                  keywords={item.keywords}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
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
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
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
