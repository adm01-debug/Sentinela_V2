import { memo, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, Menu, Sun, Moon, Monitor, User, LogOut, Settings, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/providers/ThemeProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
  onCommandPaletteOpen?: () => void;
}

const notifications = [
  { id: '1', title: 'Acesso não autorizado detectado', description: 'Carlos Silva tentou acessar área restrita', time: '2 min atrás', severity: 'critical' as const, read: false },
  { id: '2', title: 'Tentativa de exportação em massa', description: 'Ana Costa exportou 500+ registros', time: '15 min atrás', severity: 'high' as const, read: false },
  { id: '3', title: 'Login fora do horário', description: 'Pedro Santos logou às 23:45', time: '1h atrás', severity: 'medium' as const, read: true },
];

const severityDot = {
  critical: 'bg-destructive',
  high: 'bg-warning',
  medium: 'bg-info',
  low: 'bg-muted-foreground',
};

export const Header = memo(function Header({ onMenuClick, onCommandPaletteOpen }: HeaderProps) {
  const { toggleSidebarCollapse } = useUIStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(notifications.filter(n => !n.read).length);

  // Update "last seen" every 30s
  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      toggleSidebarCollapse();
    }
  };

  const handleSearchFocus = useCallback(() => {
    if (onCommandPaletteOpen) {
      onCommandPaletteOpen();
    }
  }, [onCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onCommandPaletteOpen?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCommandPaletteOpen]);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  const timeSince = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
  const timeLabel = timeSince < 60 ? `${timeSince}s` : `${Math.floor(timeSince / 60)}m`;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={handleMenuClick}
        aria-label={t('header.openNavMenu')}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex shrink-0"
        onClick={toggleSidebarCollapse}
        aria-label={t('header.toggleSidebar')}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('header.searchPlaceholder')}
            className="w-full bg-muted/50 pl-8 h-9 cursor-pointer"
            aria-label={t('header.searchLabel')}
            readOnly
            onClick={handleSearchFocus}
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium mr-1" aria-label="Sistema online">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="hidden lg:inline">Online</span>
          <span className="text-muted-foreground font-normal">· {timeLabel}</span>
        </div>

        {/* Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t('header.changeTheme')} className="shrink-0">
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
              <Sun className="h-4 w-4" />
              {t('header.themeLight')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
              <Moon className="h-4 w-4" />
              {t('header.themeDark')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
              <Monitor className="h-4 w-4" />
              {t('header.themeSystem')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative shrink-0"
              aria-label={t('header.notifications')}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="text-sm font-semibold text-foreground">Notificações</h4>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={handleMarkAllRead}>
                  <CheckCircle2 className="h-3 w-3" />
                  Marcar lidas
                </Button>
              )}
            </div>
            <ScrollArea className="h-[280px]">
              <div className="divide-y divide-border">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    className="flex gap-3 p-3 w-full text-left hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/alerts')}
                  >
                    <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${severityDot[notif.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{notif.time}</p>
                    </div>
                    {!notif.read && (
                      <Badge variant="secondary" className="text-[10px] h-5 shrink-0 self-start">Novo</Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t px-4 py-2">
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate('/alerts')}>
                Ver todas as notificações
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0" aria-label={t('header.userMenu')}>
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="Usuário" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin</p>
                <p className="text-xs text-muted-foreground">admin@sentinela.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              {t('header.myProfile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              {t('nav.settings')}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <HelpCircle className="h-4 w-4" />
              {t('header.help')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              {t('header.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});

export default Header;
