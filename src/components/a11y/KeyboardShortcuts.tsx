import React, { useEffect, useCallback, createContext, useContext, useState, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Types
export interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description: string;
  category?: string;
  action: () => void;
  enabled?: boolean;
}

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string, modifiers?: string[]) => void;
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

// Provider
interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
  defaultShortcuts?: KeyboardShortcut[];
}

export function KeyboardShortcutsProvider({
  children,
  defaultShortcuts = [],
}: KeyboardShortcutsProviderProps) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(defaultShortcuts);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => {
      // Remove existing if same key combo
      const filtered = prev.filter(
        (s) =>
          s.key !== shortcut.key ||
          JSON.stringify(s.modifiers) !== JSON.stringify(shortcut.modifiers)
      );
      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((key: string, modifiers?: string[]) => {
    setShortcuts((prev) =>
      prev.filter(
        (s) =>
          s.key !== key || JSON.stringify(s.modifiers) !== JSON.stringify(modifiers)
      )
    );
  }, []);

  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow escape key
        if (event.key !== 'Escape') return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        if (shortcut.enabled === false) return false;
        if (shortcut.key.toLowerCase() !== event.key.toLowerCase()) return false;

        const modifiers = shortcut.modifiers || [];
        const ctrlRequired = modifiers.includes('ctrl');
        const altRequired = modifiers.includes('alt');
        const shiftRequired = modifiers.includes('shift');
        const metaRequired = modifiers.includes('meta');

        return (
          event.ctrlKey === ctrlRequired &&
          event.altKey === altRequired &&
          event.shiftKey === shiftRequired &&
          event.metaKey === metaRequired
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Register help shortcut
  useEffect(() => {
    registerShortcut({
      key: '?',
      modifiers: ['shift'],
      description: 'Mostrar atalhos de teclado',
      category: 'Geral',
      action: openHelp,
    });

    return () => unregisterShortcut('?', ['shift']);
  }, [registerShortcut, unregisterShortcut, openHelp]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        shortcuts,
        registerShortcut,
        unregisterShortcut,
        isHelpOpen,
        openHelp,
        closeHelp,
      }}
    >
      {children}
      <KeyboardShortcutsHelpDialog />
    </KeyboardShortcutsContext.Provider>
  );
}

// Hook
export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      'useKeyboardShortcuts must be used within KeyboardShortcutsProvider'
    );
  }
  return context;
}

// Register shortcut hook
export function useShortcut(
  key: string,
  action: () => void,
  options: {
    modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
    description?: string;
    category?: string;
    enabled?: boolean;
  } = {}
) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcut({
      key,
      action,
      modifiers: options.modifiers,
      description: options.description || '',
      category: options.category,
      enabled: options.enabled,
    });

    return () => unregisterShortcut(key, options.modifiers);
  }, [key, action, options.modifiers, options.description, options.category, options.enabled, registerShortcut, unregisterShortcut]);
}

// Key display component
function KeyCombo({
  shortcut,
  className,
}: {
  shortcut: KeyboardShortcut;
  className?: string;
}) {
  const keys: string[] = [];

  if (shortcut.modifiers?.includes('ctrl')) keys.push('Ctrl');
  if (shortcut.modifiers?.includes('alt')) keys.push('Alt');
  if (shortcut.modifiers?.includes('shift')) keys.push('Shift');
  if (shortcut.modifiers?.includes('meta')) keys.push('⌘');

  keys.push(shortcut.key.toUpperCase());

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded border border-border/50 shadow-sm">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-xs text-muted-foreground">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Help Dialog
function KeyboardShortcutsHelpDialog() {
  const { shortcuts, isHelpOpen, closeHelp } = useKeyboardShortcuts();

  // Group by category
  const groupedShortcuts = shortcuts.reduce<Record<string, KeyboardShortcut[]>>(
    (acc, shortcut) => {
      const category = shortcut.category || 'Outros';
      if (!acc[category]) acc[category] = [];
      acc[category].push(shortcut);
      return acc;
    },
    {}
  );

  const categories = Object.keys(groupedShortcuts).sort();

  return (
    <Dialog open={isHelpOpen} onOpenChange={closeHelp}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Atalhos de Teclado</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {categories.map((category, catIndex) => (
              <div key={category}>
                {catIndex > 0 && <Separator className="mb-4" />}
                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                  {category}
                </h4>
                <div className="space-y-2">
                  {groupedShortcuts[category].map((shortcut, index) => (
                    <div
                      key={`${shortcut.key}-${index}`}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <KeyCombo shortcut={shortcut} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Standalone key hint component
export function KeyHint({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cn(
        'px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground',
        'bg-muted/50 rounded border border-border/50 shadow-sm',
        className
      )}
    >
      {children}
    </kbd>
  );
}

export default KeyboardShortcutsProvider;
