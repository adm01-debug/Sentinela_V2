import React, { useState, useMemo } from 'react';
import { Bell, BellOff, CheckCheck, Trash2, Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationItem, type Notification, type NotificationCategory, categoryLabels } from './notifications/NotificationItem';

// Re-export types and sub-components
export type { Notification, NotificationCategory } from './notifications/NotificationItem';
export type { NotificationType } from './notifications/NotificationItem';
export { NotificationPopover } from './notifications/NotificationPopover';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onDeleteAll?: () => void;
  onAction?: (notification: Notification) => void;
  onSettingsClick?: () => void;
  soundEnabled?: boolean;
  onSoundToggle?: (enabled: boolean) => void;
}

export function NotificationCenter({
  notifications, onMarkAsRead, onMarkAllAsRead, onDelete, onDeleteAll, onAction, onSettingsClick, soundEnabled = true, onSoundToggle,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | NotificationCategory>('all');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const filteredNotifications = useMemo(() => activeTab === 'all' ? notifications : notifications.filter((n) => n.category === activeTab), [notifications, activeTab]);
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length };
    notifications.forEach((n) => { counts[n.category] = (counts[n.category] || 0) + 1; });
    return counts;
  }, [notifications]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]" variant="destructive">{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notificações{unreadCount > 0 && <Badge variant="secondary">{unreadCount} novas</Badge>}</SheetTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSoundToggle?.(!soundEnabled)} title={soundEnabled ? 'Desativar som' : 'Ativar som'}>
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onMarkAllAsRead} disabled={unreadCount === 0}><CheckCheck className="h-4 w-4 mr-2" />Marcar todas como lidas</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDeleteAll} className="text-destructive focus:text-destructive" disabled={notifications.length === 0}><Trash2 className="h-4 w-4 mr-2" />Limpar todas</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSettingsClick}><Settings className="h-4 w-4 mr-2" />Configurações</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetHeader>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
              Todas{categoryCounts.all > 0 && <Badge variant="secondary" className="ml-1.5 text-xs">{categoryCounts.all}</Badge>}
            </TabsTrigger>
            {(Object.keys(categoryLabels) as NotificationCategory[]).map((category) => (
              <TabsTrigger key={category} value={category} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                {categoryLabels[category]}{(categoryCounts[category] || 0) > 0 && <Badge variant="secondary" className="ml-1.5 text-xs">{categoryCounts[category]}</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab} className="flex-1 m-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BellOff className="h-12 w-12 mb-4 opacity-20" /><p className="text-sm font-medium">Nenhuma notificação</p>
                  <p className="text-xs mt-1">{activeTab !== 'all' ? `Não há notificações de ${categoryLabels[activeTab].toLowerCase()}` : 'Você está em dia!'}</p>
                </div>
              ) : filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onMarkAsRead={onMarkAsRead} onDelete={onDelete} onAction={onAction} />
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export default NotificationCenter;
