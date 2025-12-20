import { memo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

// ============================================================
// KEYBOARD SHORTCUTS HELP MODAL
// Shows all available keyboard shortcuts to the user
// ============================================================

interface ShortcutItem {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: ShortcutItem[] = [
  // Navigation
  { keys: ['Ctrl', 'K'], description: 'Abrir busca rápida', category: 'Navegação' },
  { keys: ['Ctrl', '/'], description: 'Abrir Command Palette', category: 'Navegação' },
  { keys: ['Esc'], description: 'Fechar modal/dialog', category: 'Navegação' },
  { keys: ['Tab'], description: 'Próximo elemento', category: 'Navegação' },
  { keys: ['Shift', 'Tab'], description: 'Elemento anterior', category: 'Navegação' },
  
  // Dashboard
  { keys: ['G', 'D'], description: 'Ir para Dashboard', category: 'Páginas' },
  { keys: ['G', 'E'], description: 'Ir para Funcionários', category: 'Páginas' },
  { keys: ['G', 'V'], description: 'Ir para Violações', category: 'Páginas' },
  { keys: ['G', 'M'], description: 'Ir para Monitoramento', category: 'Páginas' },
  { keys: ['G', 'S'], description: 'Ir para Configurações', category: 'Páginas' },
  
  // Actions
  { keys: ['Ctrl', 'S'], description: 'Salvar alterações', category: 'Ações' },
  { keys: ['Ctrl', 'Enter'], description: 'Confirmar/Enviar', category: 'Ações' },
  { keys: ['Ctrl', 'N'], description: 'Novo item', category: 'Ações' },
  { keys: ['Ctrl', 'E'], description: 'Exportar dados', category: 'Ações' },
  { keys: ['Ctrl', 'R'], description: 'Atualizar dados', category: 'Ações' },
  
  // Accessibility
  { keys: ['?'], description: 'Mostrar esta ajuda', category: 'Acessibilidade' },
  { keys: ['Alt', '1'], description: 'Ir para conteúdo principal', category: 'Acessibilidade' },
  { keys: ['Alt', '2'], description: 'Ir para navegação', category: 'Acessibilidade' },
];

const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
  if (!acc[shortcut.category]) {
    acc[shortcut.category] = [];
  }
  acc[shortcut.category].push(shortcut);
  return acc;
}, {} as Record<string, ShortcutItem[]>);

interface KeyboardShortcutsHelpProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function KeyboardShortcutsHelpComponent({ 
  open: controlledOpen, 
  onOpenChange 
}: KeyboardShortcutsHelpProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  // Listen for ? key to open help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar rapidamente pela aplicação.
            Pressione <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">?</kbd> a qualquer momento para ver esta ajuda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Dica: Use <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Tab</kbd> para navegar entre elementos e{' '}
            <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Enter</kbd> para ativar.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const KeyboardShortcutsHelp = memo(KeyboardShortcutsHelpComponent);
export default KeyboardShortcutsHelp;
