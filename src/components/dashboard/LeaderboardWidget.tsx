import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star } from 'lucide-react';

interface LeaderboardItem { id: string; name: string; avatar?: string; score: number; change?: number; badge?: string; }

export function LeaderboardWidget({ items, title = 'Leaderboard', className }: { items: LeaderboardItem[]; title?: string; className?: string }) {
  const rankIcons = [<Trophy className="h-5 w-5 text-yellow-500" />, <Medal className="h-5 w-5 text-gray-400" />, <Award className="h-5 w-5 text-amber-600" />];
  const sorted = [...items].sort((a, b) => b.score - a.score);

  return (
    <Card className={className}>
      <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" />{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.slice(0, 10).map((item, i) => (
            <div key={item.id} className={cn('flex items-center gap-3 p-2 rounded-lg', i < 3 && 'bg-muted/50')}>
              <div className="w-8 flex justify-center">{i < 3 ? rankIcons[i] : <span className="text-sm text-muted-foreground">{i + 1}</span>}</div>
              <Avatar className="h-8 w-8"><AvatarImage src={item.avatar} /><AvatarFallback>{item.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p>{item.badge && <Badge variant="secondary" className="text-xs">{item.badge}</Badge>}</div>
              <div className="text-right"><p className="font-semibold">{item.score}</p>{item.change !== undefined && <p className={cn('text-xs', item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : 'text-muted-foreground')}>{item.change > 0 ? '+' : ''}{item.change}</p>}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
export default LeaderboardWidget;
