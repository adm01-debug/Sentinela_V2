import { useMemo } from 'react';
import { Trophy, Medal, Star, Award, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { useGamificationPage } from '@/hooks/useGamificationPage';
import { useChartColors } from '@/hooks/useChartColors';

export default function GamificationPage() {
  const { leaderboard, achievements, stats, period, isLoading, handlePeriodChange } = useGamificationPage();
  const colors = useChartColors();

  // Top 10 scores bar chart
  const scoreData = useMemo(() =>
    leaderboard.slice(0, 10).map(e => ({ name: (e.employee_name || '?').split(' ')[0], pontos: e.points })),
    [leaderboard]
  );

  // Level distribution pie
  const levelData = useMemo(() => {
    const levelMap: Record<number, number> = {};
    leaderboard.forEach(e => {
      levelMap[e.level] = (levelMap[e.level] || 0) + 1;
    });
    const levelColors = [colors.primary, colors.accent, colors.success, colors.warning, colors.info];
    return Object.entries(levelMap)
      .map(([level, count], i) => ({ name: `Nível ${level}`, value: count, color: levelColors[i % levelColors.length] }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [leaderboard, colors]);

  if (isLoading) {
    return <div className="p-6 space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gamificação"
        description="Rankings, badges e recompensas"
        showBackButton={false}
        actions={
          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map(p => (
              <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => handlePeriodChange(p)} className="h-9">
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Geral'}
              </Button>
            ))}
          </div>
        }
      />


      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center"><Trophy className="h-5 w-5 mx-auto text-warning" /><p className="text-2xl font-bold mt-1">{stats.totalParticipants}</p><p className="text-xs text-muted-foreground">Participantes</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Star className="h-5 w-5 mx-auto text-primary" /><p className="text-2xl font-bold mt-1">{stats.totalPoints}</p><p className="text-xs text-muted-foreground">Pontos Total</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Medal className="h-5 w-5 mx-auto text-info" /><p className="text-2xl font-bold mt-1">{stats.topScore}</p><p className="text-xs text-muted-foreground">Maior Score</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><TrendingUp className="h-5 w-5 mx-auto text-success" /><p className="text-2xl font-bold mt-1">{stats.avgScore}</p><p className="text-xs text-muted-foreground">Média</p></CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Top 10 - Pontuação</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} />
                  <YAxis tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="pontos" name="Pontos" fill={colors.warning} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Distribuição por Nível</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={levelData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {levelData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 mt-1">
              {levelData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
