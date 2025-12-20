import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal } from 'lucide-react';

interface Entry { rank: number; employee_name: string; avatar_url: string | null; points: number; level: number; badges: string[]; }
interface Props { entries: Entry[]; }

export const Leaderboard = React.memo(function Leaderboard({ entries }: Props) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-mono">#{rank}</span>;
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Ranking</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.rank} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
              <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
              <Avatar><AvatarImage src={entry.avatar_url || undefined} /><AvatarFallback>{entry.employee_name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <div className="flex-1"><p className="font-medium">{entry.employee_name}</p><p className="text-sm text-muted-foreground">Nível {entry.level}</p></div>
              <div className="text-right"><p className="font-bold">{entry.points.toLocaleString()}</p><p className="text-xs text-muted-foreground">pontos</p></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
