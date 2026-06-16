import React, { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Types
export type NotificationType = "info" | "warning" | "error" | "success";
export type NotificationCategory = "security" | "system" | "activity" | "alert";

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: unknown;
}

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

// Type config
const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  info: { icon: Info, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  error: { icon: AlertCircle, color: "text-destructive", bgColor: "bg-destructive/10" },
  success: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
};

const categoryLabels: Record<NotificationCategory, string> = {
  security: "Segurança",
  system: "Sistema",
  activity: "Atividade",
  alert: "Alertas",
};

// Single notification item
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}: {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAction?: (notification: Notification) => void;
}) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group relative flex gap-3 border-b p-4 transition-colors",
        "hover:bg-muted/50",
        !notification.isRead && "bg-primary/5"
      )}
    >
      {/* Icon */}
      <div className={cn("h-fit shrink-0 rounded-full p-2", config.bgColor)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={cn("text-sm font-medium", !notification.isRead && "font-semibold")}>
                {notification.title}
              </p>
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                {categoryLabels[notification.category]}
              </Badge>
            </div>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {notification.message}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onMarkAsRead?.(notification.id)}
                title="Marcar como lida"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete?.(notification.id)}
              title="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
          </span>

          {notification.actionUrl && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => onAction?.(notification)}
            >
              {notification.actionLabel || "Ver mais"}
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
      )}
    </div>
  );
}

// Empty state
function EmptyNotifications({ category }: { category?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <BellOff className="mb-4 h-12 w-12 opacity-20" />
      <p className="text-sm font-medium">Nenhuma notificação</p>
      <p className="mt-1 text-xs">
        {category ? `Não há notificações de ${category.toLowerCase()}` : "Você está em dia!"}
      </p>
    </div>
  );
}

// Main NotificationCenter as Sheet
export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  onAction,
  onSettingsClick,
  soundEnabled = true,
  onSoundToggle,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | NotificationCategory>("all");

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length };
    notifications.forEach((n) => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
              {unreadCount > 0 && <Badge variant="secondary">{unreadCount} novas</Badge>}
            </SheetTitle>

            <div className="flex items-center gap-1">
              {/* Sound toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onSoundToggle?.(!soundEnabled)}
                title={soundEnabled ? "Desativar som" : "Ativar som"}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>

              {/* More options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onMarkAllAsRead} disabled={unreadCount === 0}>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Marcar todas como lidas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDeleteAll}
                    className="text-destructive focus:text-destructive"
                    disabled={notifications.length === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar todas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex flex-1 flex-col"
        >
          <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Todas
              {categoryCounts.all > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {categoryCounts.all}
                </Badge>
              )}
            </TabsTrigger>
            {(Object.keys(categoryLabels) as NotificationCategory[]).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                {categoryLabels[category]}
                {(categoryCounts[category] || 0) > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-xs">
                    {categoryCounts[category]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="m-0 flex-1">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {filteredNotifications.length === 0 ? (
                <EmptyNotifications
                  category={activeTab !== "all" ? categoryLabels[activeTab] : undefined}
                />
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                    onAction={onAction}
                  />
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Compact popover version
export function NotificationPopover({
  notifications,
  onMarkAsRead,
  onViewAll,
  limit = 5,
}: {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onViewAll?: () => void;
  limit?: number;
}) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentNotifications = notifications.slice(0, limit);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="text-sm font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} novas
            </Badge>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {recentNotifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BellOff className="mx-auto mb-2 h-8 w-8 opacity-20" />
              <p className="text-sm">Sem notificações</p>
            </div>
          ) : (
            recentNotifications.map((notification) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "flex cursor-pointer gap-3 border-b p-3 last:border-0 hover:bg-muted/50",
                    !notification.isRead && "bg-primary/5"
                  )}
                  onClick={() => onMarkAsRead?.(notification.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onMarkAsRead?.(notification.id);
                    }
                  }}
                >
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.color)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{notification.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.timestamp, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              );
            })
          )}
        </ScrollArea>

        {notifications.length > limit && (
          <div className="border-t p-2">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onViewAll}>
              Ver todas ({notifications.length})
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;
