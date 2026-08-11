import { memo, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { useGlobalShortcuts, groupShortcuts, formatShortcutKey } from '@/hooks/useGlobalShortcuts';
import { cn } from '@/lib/utils';

export const KeyboardShortcutsProvider = memo(function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const shortcuts = useGlobalShortcuts(toggle);
  const grouped = groupShortcuts(shortcuts);

  return (
    <>
      {children}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" />
              Atalhos de Teclado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category}
                </h3>
                <div className="space-y-1.5">
                  {items.map((s) => (
                    <div
                      key={formatShortcutKey(s)}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                    >
                      <span className="text-sm text-card-foreground">{s.description}</span>
                      <kbd className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded',
                        'bg-muted border border-border text-xs font-mono text-muted-foreground'
                      )}>
                        {formatShortcutKey(s)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Pressione <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] font-mono">Shift + ?</kbd> para abrir/fechar
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
});
