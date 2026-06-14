import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Command,
  LayoutDashboard,
  Users,
  Monitor,
  AlertTriangle,
  Settings,
  FileText,
  Map,
  Calendar,
  ArrowRight,
  Clock,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================================
// TYPES
// ============================================================

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  keywords?: string[];
  favorite?: boolean;
}

interface SearchCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results?: SearchResult[];
  recentSearches?: string[];
  favorites?: SearchResult[];
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  className?: string;
}

// ============================================================
// DEFAULT NAVIGATION ITEMS
// ============================================================

const defaultNavigationItems: SearchResult[] = [
  { id: 'dashboard', title: 'Dashboard', category: 'Navegação', icon: LayoutDashboard, href: '/', keywords: ['inicio', 'home'] },
  { id: 'employees', title: 'Funcionários', category: 'Navegação', icon: Users, href: '/employees', keywords: ['equipe', 'colaboradores'] },
  { id: 'monitoring', title: 'Monitoramento', category: 'Navegação', icon: Monitor, href: '/monitoring', keywords: ['atividade', 'tempo real'] },
  { id: 'violations', title: 'Violações', category: 'Navegação', icon: AlertTriangle, href: '/violations', keywords: ['alertas', 'incidentes'] },
  { id: 'reports', title: 'Relatórios', category: 'Navegação', icon: FileText, href: '/reports', keywords: ['exportar', 'dados'] },
  { id: 'geofencing', title: 'Geofencing', category: 'Navegação', icon: Map, href: '/geofencing', keywords: ['localização', 'cercas'] },
  { id: 'schedules', title: 'Horários', category: 'Navegação', icon: Calendar, href: '/work-schedules', keywords: ['jornada', 'expediente'] },
  { id: 'settings', title: 'Configurações', category: 'Navegação', icon: Settings, href: '/settings', keywords: ['preferências', 'conta'] },
];

const categories: SearchCategory[] = [
  { id: 'navigation', label: 'Navegação', icon: LayoutDashboard },
  { id: 'employees', label: 'Funcionários', icon: Users },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

const shortcuts = [
  { key: '/', label: 'Buscar' },
  { key: 'g h', label: 'Ir para Dashboard' },
  { key: 'g e', label: 'Ir para Funcionários' },
  { key: 'g m', label: 'Ir para Monitoramento' },
  { key: 'g s', label: 'Ir para Configurações' },
  { key: 'Esc', label: 'Fechar' },
];

// ============================================================
// SEARCH RESULT ITEM
// ============================================================

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onSelect: () => void;
}

const SearchResultItem = memo(function SearchResultItem({
  result,
  isSelected,
  onSelect,
}: SearchResultItemProps) {
  const Icon = result.icon || FileText;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors',
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{result.title}</span>
          {result.favorite && <Star className="h-3 w-3 text-warning fill-warning" />}
        </div>
        {result.description && (
          <p className="text-sm text-muted-foreground truncate">{result.description}</p>
        )}
      </div>
      <Badge variant="secondary" className="text-xs shrink-0">
        {result.category}
      </Badge>
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
});

// ============================================================
// RECENT SEARCHES
// ============================================================

interface RecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
}

const RecentSearches = memo(function RecentSearches({
  searches,
  onSelect,
}: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Buscas recentes</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={() => onSelect(search)}
            className="px-3 py-1 text-sm bg-muted rounded-full hover:bg-muted/80 transition-colors"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
});

// ============================================================
// KEYBOARD SHORTCUTS PANEL
// ============================================================

const KeyboardShortcutsPanel = memo(function KeyboardShortcutsPanel() {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="text-xs text-muted-foreground mb-3">Atalhos de teclado</div>
      <div className="grid grid-cols-2 gap-2">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.key} className="flex items-center gap-2 text-sm">
            <kbd className="px-2 py-0.5 text-xs bg-muted rounded border font-mono">
              {shortcut.key}
            </kbd>
            <span className="text-muted-foreground">{shortcut.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ============================================================
// MAIN COMPONENT
// ============================================================

function SearchDrawerComponent({
  open,
  onOpenChange,
  results: externalResults,
  recentSearches = [],
  favorites = [],
  onSearch,
  isLoading = false,
  className,
}: SearchDrawerProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Combine results
  const allResults = useMemo(() => {
    if (query.trim()) {
      const searchQuery = query.toLowerCase();
      
      // Filter navigation items
      const navResults = defaultNavigationItems.filter((item) => {
        const matchTitle = item.title.toLowerCase().includes(searchQuery);
        const matchKeywords = item.keywords?.some((k) => k.includes(searchQuery));
        return matchTitle || matchKeywords;
      });

      // Combine with external results
      return [...navResults, ...(externalResults || [])];
    }

    // Show favorites when no query
    if (favorites.length > 0) {
      return favorites;
    }

    // Show all navigation items
    return defaultNavigationItems;
  }, [query, externalResults, favorites]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [allResults]);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (allResults[selectedIndex]) {
            handleSelect(allResults[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, allResults, selectedIndex]);

  const handleSelect = useCallback((result: SearchResult) => {
    if (result.action) {
      result.action();
    } else if (result.href) {
      navigate(result.href);
    }
    onOpenChange(false);
  }, [navigate, onOpenChange]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleRecentSelect = useCallback((search: string) => {
    setQuery(search);
    onSearch?.(search);
  }, [onSearch]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    
    allResults.forEach((result) => {
      if (!groups[result.category]) {
        groups[result.category] = [];
      }
      groups[result.category].push(result);
    });

    return groups;
  }, [allResults]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-2xl p-0 gap-0', className)}>
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            placeholder="Buscar páginas, funcionários, relatórios..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="border-0 focus-visible:ring-0 px-0 text-base"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex px-2 py-0.5 text-xs bg-muted rounded border font-mono">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-4">
            {/* Recent Searches (when no query) */}
            {!query && recentSearches.length > 0 && (
              <RecentSearches
                searches={recentSearches}
                onSelect={handleRecentSelect}
              />
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Buscando...
              </div>
            )}

            {/* Results */}
            {!isLoading && allResults.length > 0 && (
              <div className="space-y-4">
                {Object.entries(groupedResults).map(([category, results]) => (
                  <div key={category} className="space-y-1">
                    <div className="text-xs text-muted-foreground font-medium px-2 mb-2">
                      {category}
                    </div>
                    {results.map((result) => {
                      const globalIndex = allResults.indexOf(result);
                      return (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          isSelected={globalIndex === selectedIndex}
                          onSelect={() => handleSelect(result)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && query && allResults.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Nenhum resultado para "{query}"
                </p>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            {!query && <KeyboardShortcutsPanel />}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export const SearchDrawer = memo(SearchDrawerComponent);

// ============================================================
// SEARCH TRIGGER BUTTON
// ============================================================

interface SearchTriggerProps {
  onClick: () => void;
  className?: string;
}

function SearchTriggerComponent({ onClick, className }: SearchTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50 text-muted-foreground',
        'hover:bg-muted transition-colors',
        className
      )}
    >
      <Search className="h-4 w-4" />
      <span className="text-sm hidden sm:inline">Buscar...</span>
      <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] bg-background rounded border font-mono">
        ⌘K
      </kbd>
    </button>
  );
}

export const SearchTrigger = memo(SearchTriggerComponent);
