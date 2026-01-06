import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Home, Search, Bell, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MobileNavItem { id: string; label: string; icon: React.ReactNode; badge?: number; onClick?: () => void; }

const defaultItems: MobileNavItem[] = [
  { id: 'home', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { id: 'search', label: 'Search', icon: <Search className="h-5 w-5" /> },
  { id: 'notifications', label: 'Alerts', icon: <Bell className="h-5 w-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

export function MobileBottomNav({ items = defaultItems, activeId, onItemClick, className }: { items?: MobileNavItem[]; activeId?: string; onItemClick?: (id: string) => void; className?: string }) {
  return (
    <nav className={cn('fixed bottom-0 left-0 right-0 bg-background border-t safe-area-inset-bottom', className)}>
      <div className="flex items-center justify-around py-2">
        {items.map(item => (
          <button key={item.id} onClick={() => { item.onClick?.(); onItemClick?.(item.id); }} className={cn('flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors', activeId === item.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">{item.badge > 9 ? '9+' : item.badge}</span>}
            </div>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export function MobileHeader({ title, showBack, onBack, rightAction, className }: { title: string; showBack?: boolean; onBack?: () => void; rightAction?: React.ReactNode; className?: string }) {
  return (
    <header className={cn('sticky top-0 z-40 bg-background border-b safe-area-inset-top', className)}>
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && <Button variant="ghost" size="icon" onClick={onBack}><Menu className="h-5 w-5" /></Button>}
          <h1 className="font-semibold truncate">{title}</h1>
        </div>
        {rightAction}
      </div>
    </header>
  );
}
