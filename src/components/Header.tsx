import { Bell, Search, Menu, Sun, Moon } from 'lucide-react';
import { useUIStore, useAuthStore, useThemeStore } from '@/stores';
import { Avatar } from './ui/Avatar';
import { Dropdown, DropdownItem } from './ui/Dropdown';
import { useLogout } from '@/hooks';

export const Header = () => {
  const { toggleSidebar, openCommandPalette } = useUIStore();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const logout = useLogout();

  return (
    <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar}><Menu className="h-5 w-5" /></button>
        <button onClick={openCommandPalette} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm text-muted-foreground">
          <Search className="h-4 w-4" /><span>Search...</span><kbd className="ml-2 text-xs">⌘K</kbd>
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme}>{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
        <button className="relative"><Bell className="h-5 w-5" /><span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">3</span></button>
        <Dropdown trigger={<Avatar src={user?.avatar} alt={user?.name} size="sm" />} align="right">
          <DropdownItem>Profile</DropdownItem>
          <DropdownItem>Settings</DropdownItem>
          <DropdownItem onClick={() => logout.mutate()}>Logout</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
};