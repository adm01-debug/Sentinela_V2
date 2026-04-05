import { memo, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, Menu, Sun, Moon, Monitor, User, LogOut, Settings, HelpCircle, CheckCircle2, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useHeaderNotifications } from '@/hooks/useNotifications';
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

const severityDot: Record<string, string> = {
  critical: 'bg-destructive',
  high: 'bg-warning',
  medium: 'bg-info',
  low: 'bg-muted-foreground',
};

export const Header = memo(function Header({ onMenuClick, onCommandPaletteOpen }: HeaderProps) {
  const { toggleSidebarCollapse } = useUIStore();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useHeaderNotifications();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Derive user display info
  const displayName = useMemo(() => {
    if (!user) return 'Usuário';
    return user.name || user.email?.split('@')[0] || 'Usuário';
  }, [user]);

  const displayEmail = user?.email || '';

  const initials = useMemo(() => {
    if (!displayName || displayName === 'Usuário') return 'U';
    return displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [displayName]);

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

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/auth');
  }, [logout, navigate]);

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  const timeSince = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
  const timeLabel = timeSince < 60 ? `${timeSince}s` : `${Math.floor(timeSince / 60)}m`;

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border/60 bg-background/95 backdrop-blur-sm px-3 sm:px-4">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0 h-8 w-8"
        onClick={handleMenuClick}
        aria-label={t('header.openNavMenu')}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Desktop sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex shrink-0 h-8 w-8"
        onClick={toggleSidebarCollapse}
        aria-label={t('header.toggleSidebar')}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('header.searchPlaceholder')}
            className="w-full bg-muted/40 pl-7 h-8 text-sm border-transparent hover:border-border focus:border-primary cursor-pointer transition-colors"
            aria-label={t('header.searchLabel')}
            readOnly
            onClick={handleSearchFocus}
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {/* Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium mr-0.5" aria-label="Sistema online">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
          </span>
          <span className="text-success hidden lg:inline">Online</span>
          <span className="text-muted-foreground font-normal">· {timeLabel}</span>
        </div>

        {/* Theme */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t('header.changeTheme')} className="shrink-0 h-8 w-8">
              <ThemeIcon className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 text-xs">
              <Sun className="h-3.5 w-3.5" />
              {t('header.themeLight')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 text-xs">
              <Moon className="h-3.5 w-3.5" />
              {t('header.themeDark')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2 text-xs">
              <Monitor className="h-3.5 w-3.5" />
              {t('header.themeSystem')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative shrink-0 h-8 w-8"
              aria-label={t('header.notifications')}
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-2.5 border-b">
              <h4 className="text-sm font-semibold text-foreground">Notificações</h4>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-6 gap-1 px-2" onClick={handleMarkAllRead}>
                  <CheckCircle2 className="h-3 w-3" />
                  Marcar lidas
                </Button>
              )}
            </div>
            <ScrollArea className="h-[260px]">
              <div className="divide-y divide-border">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    className="flex gap-2.5 p-3 w-full text-left hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/alerts')}
                  >
                    <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${severityDot[notif.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground leading-snug">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.description}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">{notif.time}</p>
                    </div>
                    {!notif.read && (
                      <Badge variant="secondary" className="text-[10px] h-5 shrink-0 self-start bg-primary/10 text-primary border-0">Novo</Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t px-4 py-1.5">
              <Button variant="ghost" size="sm" className="w-full text-xs h-7" onClick={() => navigate('/alerts')}>
                Ver todas as notificações
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-5 mx-0.5 hidden sm:block" />

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0" aria-label={t('header.userMenu')}>
              <Avatar className="h-7 w-7 ring-2 ring-primary/10 transition-shadow hover:ring-primary/30">
                <AvatarImage src={user?.avatar || ''} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-[11px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar || ''} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings/profile')} className="gap-2 cursor-pointer text-xs">
              <User className="h-3.5 w-3.5" />
              {t('header.myProfile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 cursor-pointer text-xs">
              <Settings className="h-3.5 w-3.5" />
              {t('nav.settings')}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-xs">
              <HelpCircle className="h-3.5 w-3.5" />
              {t('header.help')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive">
              <LogOut className="h-3.5 w-3.5" />
              {t('header.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});

export default Header;
