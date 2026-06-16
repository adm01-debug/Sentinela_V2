import { memo, useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  {
    id: "dashboard",
    title: "Dashboard",
    category: "Navegação",
    icon: LayoutDashboard,
    href: "/",
    keywords: ["inicio", "home"],
  },
  {
    id: "employees",
    title: "Funcionários",
    category: "Navegação",
    icon: Users,
    href: "/employees",
    keywords: ["equipe", "colaboradores"],
  },
  {
    id: "monitoring",
    title: "Monitoramento",
    category: "Navegação",
    icon: Monitor,
    href: "/monitoring",
    keywords: ["atividade", "tempo real"],
  },
  {
    id: "violations",
    title: "Violações",
    category: "Navegação",
    icon: AlertTriangle,
    href: "/violations",
    keywords: ["alertas", "incidentes"],
  },
  {
    id: "reports",
    title: "Relatórios",
    category: "Navegação",
    icon: FileText,
    href: "/reports",
    keywords: ["exportar", "dados"],
  },
  {
    id: "geofencing",
    title: "Geofencing",
    category: "Navegação",
    icon: Map,
    href: "/geofencing",
    keywords: ["localização", "cercas"],
  },
  {
    id: "schedules",
    title: "Horários",
    category: "Navegação",
    icon: Calendar,
    href: "/work-schedules",
    keywords: ["jornada", "expediente"],
  },
  {
    id: "settings",
    title: "Configurações",
    category: "Navegação",
    icon: Settings,
    href: "/settings",
    keywords: ["preferências", "conta"],
  },
];

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

const shortcuts = [
  { key: "/", label: "Buscar" },
  { key: "g h", label: "Ir para Dashboard" },
  { key: "g e", label: "Ir para Funcionários" },
  { key: "g m", label: "Ir para Monitoramento" },
  { key: "g s", label: "Ir para Configurações" },
  { key: "Esc", label: "Fechar" },
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
        "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{result.title}</span>
          {result.favorite && <Star className="h-3 w-3 fill-warning text-warning" />}
        </div>
        {result.description && (
          <p className="truncate text-sm text-muted-foreground">{result.description}</p>
        )}
      </div>
      <Badge variant="secondary" className="shrink-0 text-xs">
        {result.category}
      </Badge>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
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

const RecentSearches = memo(function RecentSearches({ searches, onSelect }: RecentSearchesProps) {
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
            className="rounded-full bg-muted px-3 py-1 text-sm transition-colors hover:bg-muted/80"
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
    <div className="mt-4 border-t pt-4">
      <div className="mb-3 text-xs text-muted-foreground">Atalhos de teclado</div>
      <div className="grid grid-cols-2 gap-2">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.key} className="flex items-center gap-2 text-sm">
            <kbd className="rounded border bg-muted px-2 py-0.5 font-mono text-xs">
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
  const [query, setQuery] = useState("");
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
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.action) {
        result.action();
      } else if (result.href) {
        navigate(result.href);
      }
      onOpenChange(false);
    },
    [navigate, onOpenChange]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (allResults[selectedIndex]) {
            handleSelect(allResults[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, allResults, selectedIndex, handleSelect]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const handleRecentSelect = useCallback(
    (search: string) => {
      setQuery(search);
      onSearch?.(search);
    },
    [onSearch]
  );

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
      <DialogContent className={cn("max-w-2xl gap-0 p-0", className)}>
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Buscar páginas, funcionários, relatórios..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="border-0 px-0 text-base focus-visible:ring-0"
          />
          <kbd className="hidden rounded border bg-muted px-2 py-0.5 font-mono text-xs sm:inline-flex">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-4">
            {/* Recent Searches (when no query) */}
            {!query && recentSearches.length > 0 && (
              <RecentSearches searches={recentSearches} onSelect={handleRecentSelect} />
            )}

            {/* Loading State */}
            {isLoading && <div className="py-8 text-center text-muted-foreground">Buscando...</div>}

            {/* Results */}
            {!isLoading && allResults.length > 0 && (
              <div className="space-y-4">
                {Object.entries(groupedResults).map(([category, results]) => (
                  <div key={category} className="space-y-1">
                    <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
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
              <div className="py-8 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Nenhum resultado para &quot;{query}&quot;</p>
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
        "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-muted-foreground",
        "transition-colors hover:bg-muted",
        className
      )}
    >
      <Search className="h-4 w-4" />
      <span className="hidden text-sm sm:inline">Buscar...</span>
      <kbd className="hidden rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] md:inline-flex">
        ⌘K
      </kbd>
    </button>
  );
}

export const SearchTrigger = memo(SearchTriggerComponent);
