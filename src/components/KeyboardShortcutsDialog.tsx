import { memo, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';


interface Shortcut {
  keys: string[];
  description: string;
}

const shortcutGroups: { title: string; shortcuts: Shortcut[] }[] = [
  {
    title: 'Navegação',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Abrir paleta de comandos' },
      { keys: ['Shift', '?'], description: 'Mostrar atalhos do teclado' },
    ],
  },
  {
    title: 'Ações',
    shortcuts: [
      { keys: ['⌘', 'B'], description: 'Expandir/recolher sidebar' },
      { keys: ['Esc'], description: 'Fechar diálogo/modal' },
    ],
  },
];

export const KeyboardShortcutsDialog = memo(function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Atalhos do Teclado</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, ki) => (
                        <kbd
                          key={ki}
                          className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border bg-muted px-1.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          Pressione <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1 text-[10px] font-medium text-muted-foreground mx-0.5">Shift</kbd>
          <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1 text-[10px] font-medium text-muted-foreground mx-0.5">?</kbd>
          para abrir/fechar
        </p>
      </DialogContent>
    </Dialog>
  );
});

export default KeyboardShortcutsDialog;
