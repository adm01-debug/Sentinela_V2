import { useCommandPalette } from '@/hooks/useCommandPalette';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

export function CommandPalette() {
  const { isOpen, close, query, setQuery, groups, selectedIndex, executeCommand } = useCommandPalette();
  const allCommands = groups.flatMap(g => g.commands);

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="p-0 max-w-lg">
        <Input
          placeholder="Digite um comando..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="border-0 border-b rounded-none"
        />
        <div className="max-h-80 overflow-auto p-2">
          {groups.map(group => (
            <div key={group.id} className="mb-2">
              <div className="text-xs text-muted-foreground px-2 py-1">{group.label}</div>
              {group.commands.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd.id)}
                  className={cn('w-full text-left px-2 py-1.5 rounded', i === selectedIndex && 'bg-accent')}
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
