import { Trophy, Medal, Star, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useGamificationPage } from '@/hooks/useGamificationPage';

export default function GamificationPage() {
  const { leaderboard, achievements, stats, period, isLoading, handlePeriodChange } = useGamificationPage();

  if (isLoading) {
    return <div className="p-6 space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-500" />Gamificação</h1>
          <p className="text-muted-foreground mt-1">Rankings, badges e recompensas dos funcionários</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map(p => (
            <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => handlePeriodChange(p)}>
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Geral'}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center"><Trophy className="h-5 w-5 mx-auto text-yellow-500" /><p className="text-2xl font-bold mt-1">{stats.totalParticipants}</p><p className="text-xs text-muted-foreground">Participantes</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Star className="h-5 w-5 mx-auto text-primary" /><p className="text-2xl font-bold mt-1">{stats.totalPoints}</p><p className="text-xs text-muted-foreground">Pontos Total</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Medal className="h-5 w-5 mx-auto text-orange-500" /><p className="text-2xl font-bold mt-1">{stats.topScore}</p><p className="text-xs text-muted-foreground">Maior Score</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><TrendingUp className="h-5 w-5 mx-auto text-green-500" /><p className="text-2xl font-bold mt-1">{stats.avgScore}</p><p className="text-xs text-muted-foreground">Média</p></CardContent></Card>
      </div>

      <Tabs defaultValue="leaderboard">
        <TabsList><TabsTrigger value="leaderboard">🏆 Ranking</TabsTrigger><TabsTrigger value="achievements">🎖️ Conquistas</TabsTrigger></TabsList>

        <TabsContent value="leaderboard" className="space-y-3 mt-4">
          {leaderboard.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum dado de ranking disponível.</p></CardContent></Card>
          ) : (
            leaderboard.map((entry, i) => (
              <Card key={entry.id} className={i < 3 ? 'border-yellow-200 bg-yellow-50/30 dark:bg-yellow-500/5' : ''}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
                  </div>
                  <Avatar><AvatarFallback>{entry.employee_name?.charAt(0) || '?'}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{entry.employee_name}</p>
                    <div className="flex gap-1 mt-1">
                      {entry.badges?.slice(0, 3).map((b, j) => <Badge key={j} variant="outline" className="text-xs">{b}</Badge>)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{entry.points}</p>
                    <p className="text-xs text-muted-foreground">Nível {entry.level}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          {!achievements?.length ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Award className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma conquista configurada.</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map(a => (
                <Card key={a.id}>
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">{a.icon || '🏅'}</div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge variant="outline">{a.points} pts</Badge>
                      <Badge variant="secondary">{a.unlocked_count} desbloquearam</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { GamificationPage };
