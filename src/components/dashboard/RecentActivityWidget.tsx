import * as React from 'react';
import { useState, useEffect } from 'react';
import { Clock, User, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityItem { id: string; user: string; action: string; target?: string; timestamp: Date; type?: 'info' | 'warning' | 'success' | 'error'; }

export function RecentActivityWidget({ activities, maxItems = 10, className }: { activities: ActivityItem[]; maxItems?: number; className?: string }) {
  const typeColors = { info: 'bg-blue-100 text-blue-800', warning: 'bg-yellow-100 text-yellow-800', success: 'bg-green-100 text-green-800', error: 'bg-red-100 text-red-800' };
  const formatTime = (date: Date) => { const diff = Date.now() - date.getTime(); if (diff < 60000) return 'Just now'; if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`; if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`; return date.toLocaleDateString(); };

  return (
    <Card className={className}>
      <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Recent Activity</CardTitle></CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {activities.slice(0, maxItems).map(item => (
              <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><User className="h-4 w-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm"><span className="font-medium">{item.user}</span> {item.action} {item.target && <span className="text-muted-foreground">{item.target}</span>}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(item.timestamp)}</span>
                    {item.type && <Badge className={cn('text-xs', typeColors[item.type])}>{item.type}</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
export default RecentActivityWidget;
