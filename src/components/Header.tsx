import { memo } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/uiStore';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = memo(function Header({ onMenuClick }: HeaderProps) {
  const { toggleSidebarCollapse } = useUIStore();

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      toggleSidebarCollapse();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={handleMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full bg-muted/50 pl-8"
          />
        </div>
      </div>
      
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
          3
        </span>
        <span className="sr-only">Notifications</span>
      </Button>
    </header>
  );
});

export default Header;
