import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification { id: string; title: string; message: string; type: 'info' | 'warning' | 'success' | 'error'; timestamp: Date; read: boolean; link?: string; }

export function NotificationsWidget({ notifications, onMarkRead, onDismiss, className }: { notifications: Notification[]; onMarkRead?: (id) => void; onDismiss?: (id) => void; className?: string }) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const typeColors = { info: 'bg-blue-100 text-blue-800 border-blue-200', warning: 'bg-yellow-100 text-yellow-800 border-yellow-200', success: 'bg-green-100 text-green-800 border-green-200', error: 'bg-red-100 text-red-800 border-red-200' };
  const formatTime = (d: Date) => { const diff = Date.now() - d.getTime(); if (diff < 60000) return 'Now'; if (diff < 3600000) return `${Math.floor(diff/60000)}m`; if (diff < 86400000) return `${Math.floor(diff/3600000)}h`; return d.toLocaleDateString(); };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notifications {unreadCount > 0 && <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <div className="space-y-2">
            {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>}
            {notifications.map(n => (
              <div key={n.id} className={`p-3 rounded-lg border ${typeColors[n.type]} ${!n.read ? 'ring-2 ring-primary/20' : 'opacity-75'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1"><p className="font-medium text-sm">{n.title}</p><p className="text-xs mt-1 opacity-80">{n.message}</p></div>
                  <div className="flex gap-1">
                    {!n.read && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMarkRead?.(n.id)}><Check className="h-3 w-3" /></Button>}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDismiss?.(n.id)}><X className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-60">{formatTime(n.timestamp)}</span>
                  {n.link && <Button variant="link" size="sm" className="h-auto p-0 text-xs"><ExternalLink className="h-3 w-3 mr-1" />View</Button>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
export default NotificationsWidget;
