import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar colaborador, dispositivo..." 
            className="pl-10 bg-secondary border-border"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationsPanel />
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
