import React, { useState, memo, useCallback } from 'react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavGroupItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: number | string;
}

interface CollapsibleNavGroupProps {
  label: string;
  icon?: LucideIcon;
  items: NavGroupItem[];
  defaultOpen?: boolean;
  isCollapsed?: boolean;
  activeItemId?: string;
  onItemClick?: (item: NavGroupItem) => void;
}

export const CollapsibleNavGroup = memo(function CollapsibleNavGroup({
  label,
  icon: Icon,
  items,
  defaultOpen = false,
  isCollapsed = false,
  activeItemId,
  onItemClick,
}: CollapsibleNavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasActiveItem = items.some((item) => item.id === activeItemId);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {items.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="icon"
            className={cn(
              'w-full',
              item.id === activeItemId && 'bg-accent text-accent-foreground'
            )}
            onClick={() => onItemClick?.(item)}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-between px-3 py-2',
            hasActiveItem && 'bg-accent/50'
          )}
          onClick={handleToggle}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-4 w-4" />}
            <span className="text-sm font-medium">{label}</span>
          </div>
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 mt-1 space-y-1 border-l pl-3"
            >
              {items.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-2 px-3 py-1.5',
                    item.id === activeItemId && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => onItemClick?.(item)}
                >
                  {item.icon && <item.icon className="h-3.5 w-3.5" />}
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {item.badge}
                    </span>
                  )}
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
});

// Recent Pages Component
interface RecentPage {
  id: string;
  title: string;
  href: string;
  icon?: LucideIcon;
  timestamp: Date;
}

interface RecentPagesProps {
  pages: RecentPage[];
  maxItems?: number;
  onPageClick?: (page: RecentPage) => void;
  onClear?: () => void;
}

export const RecentPages = memo(function RecentPages({
  pages,
  maxItems = 5,
  onPageClick,
  onClear,
}: RecentPagesProps) {
  const recentPages = pages.slice(0, maxItems);

  if (recentPages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-3">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          Recentes
        </span>
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={onClear}
          >
            Limpar
          </Button>
        )}
      </div>
      <div className="space-y-1">
        {recentPages.map((page) => (
          <Button
            key={page.id}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 px-3"
            onClick={() => onPageClick?.(page)}
          >
            {page.icon && <page.icon className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className="truncate text-sm">{page.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
});

// Favorites/Pinned Pages Component
interface FavoritePage {
  id: string;
  title: string;
  href: string;
  icon?: LucideIcon;
}

interface FavoritePagesProps {
  pages: FavoritePage[];
  onPageClick?: (page: FavoritePage) => void;
  onRemove?: (page: FavoritePage) => void;
  isEditing?: boolean;
}

export const FavoritePages = memo(function FavoritePages({
  pages,
  onPageClick,
  onRemove,
  isEditing = false,
}: FavoritePagesProps) {
  if (pages.length === 0) {
    return (
      <div className="px-3 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhuma página favorita
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Clique no ⭐ para adicionar favoritos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="px-3">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          Favoritos
        </span>
      </div>
      <div className="space-y-1">
        {pages.map((page) => (
          <div key={page.id} className="group flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 px-3"
              onClick={() => onPageClick?.(page)}
            >
              {page.icon && <page.icon className="h-3.5 w-3.5 text-muted-foreground" />}
              <span className="truncate text-sm">{page.title}</span>
            </Button>
            {isEditing && onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(page)}
              >
                <span className="text-xs">×</span>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

// Navigation Search Component
interface NavSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  results?: NavGroupItem[];
  onResultClick?: (item: NavGroupItem) => void;
}

export const NavSearch = memo(function NavSearch({
  placeholder = 'Buscar navegação...',
  onSearch,
  results = [],
  onResultClick,
}: NavSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  return (
    <div className="relative px-3">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <AnimatePresence>
        {isFocused && query && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-3 right-3 top-full z-50 mt-1 rounded-md border bg-popover p-1 shadow-md"
          >
            {results.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  onResultClick?.(item);
                  setQuery('');
                }}
              >
                {item.icon && <item.icon className="h-3.5 w-3.5" />}
                <span className="truncate">{item.label}</span>
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Keyboard Shortcut Indicator
interface KeyboardShortcutIndicatorProps {
  keys: string[];
  className?: string;
}

export const KeyboardShortcutIndicator = memo(function KeyboardShortcutIndicator({
  keys,
  className,
}: KeyboardShortcutIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <span className="text-muted-foreground text-xs">+</span>}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </div>
  );
});
