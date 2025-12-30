import React from 'react';
import { cn } from '@/lib/utils';
import { Keyboard, Command, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

// ============================================
// KEYBOARD KEY
// ============================================

interface KeyboardKeyProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}

export function KeyboardKey({
  children,
  size = 'md',
  variant = 'default',
  className,
}: KeyboardKeyProps) {
  const sizeStyles = {
    sm: 'min-w-[18px] h-5 px-1 text-[10px]',
    md: 'min-w-[22px] h-6 px-1.5 text-xs',
    lg: 'min-w-[28px] h-7 px-2 text-sm',
  };

  const variantStyles = {
    default: 'bg-muted border-border shadow-sm',
    outline: 'bg-background border-input',
  };

  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded border font-mono font-medium',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </kbd>
  );
}

// ============================================
// KEYBOARD SHORTCUT
// ============================================

interface KeyboardShortcutProps {
  keys: string[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  separator?: string;
  className?: string;
}

const keySymbols: Record<string, React.ReactNode> = {
  cmd: <Command className="h-3 w-3" />,
  command: <Command className="h-3 w-3" />,
  meta: <Command className="h-3 w-3" />,
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: '⌥',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  backspace: '⌫',
  delete: '⌦',
  escape: 'Esc',
  esc: 'Esc',
  tab: '⇥',
  space: '␣',
  up: <ArrowUp className="h-3 w-3" />,
  down: <ArrowDown className="h-3 w-3" />,
  left: <ArrowLeft className="h-3 w-3" />,
  right: <ArrowRight className="h-3 w-3" />,
};

export function KeyboardShortcut({
  keys,
  size = 'md',
  variant = 'default',
  separator = '+',
  className,
}: KeyboardShortcutProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {keys.map((key, index) => {
        const lowerKey = key.toLowerCase();
        const symbol = keySymbols[lowerKey] || key.toUpperCase();

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-muted-foreground text-xs mx-0.5">{separator}</span>
            )}
            <KeyboardKey size={size} variant={variant}>
              {symbol}
            </KeyboardKey>
          </React.Fragment>
        );
      })}
    </span>
  );
}

// ============================================
// SHORTCUT HINT
// ============================================

interface ShortcutHintProps {
  label: string;
  keys: string[];
  className?: string;
}

export function ShortcutHint({ label, keys, className }: ShortcutHintProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <KeyboardShortcut keys={keys} size="sm" />
    </div>
  );
}

// ============================================
// SHORTCUT LIST
// ============================================

interface ShortcutItem {
  label: string;
  keys: string[];
  category?: string;
}

interface ShortcutListProps {
  shortcuts: ShortcutItem[];
  groupByCategory?: boolean;
  className?: string;
}

export function ShortcutList({
  shortcuts,
  groupByCategory = true,
  className,
}: ShortcutListProps) {
  if (!groupByCategory) {
    return (
      <div className={cn('space-y-2', className)}>
        {shortcuts.map((shortcut, i) => (
          <ShortcutHint key={i} label={shortcut.label} keys={shortcut.keys} />
        ))}
      </div>
    );
  }

  const grouped = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Geral';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-sm font-medium mb-3">{category}</h4>
          <div className="space-y-2">
            {items.map((shortcut, i) => (
              <ShortcutHint key={i} label={shortcut.label} keys={shortcut.keys} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// KEYBOARD SHORTCUTS DIALOG
// ============================================

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KeyboardShortcutsDialogProps {
  shortcuts: ShortcutItem[];
  trigger?: React.ReactNode;
}

export function KeyboardShortcutsDialog({
  shortcuts,
  trigger,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Keyboard className="h-4 w-4 mr-2" />
            Atalhos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de teclado
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <ShortcutList shortcuts={shortcuts} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default {
  KeyboardKey,
  KeyboardShortcut,
  ShortcutHint,
  ShortcutList,
  KeyboardShortcutsDialog,
};
