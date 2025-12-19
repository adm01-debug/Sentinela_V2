import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Star,
  Flame,
  TrendingUp,
  Crown,
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  useLeaderboard, 
  useAllBadges, 
  rarityConfig, 
  categoryConfig 
} from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

export default function Gamification() {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard(period, 20);
  const { data: badges, isLoading: loadingBadges } = useAllBadges();

  const groupedBadges = badges?.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, typeof badges>);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-amber-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-700" />;
      default: return <span className="text-sm font-bold text-muted-foreground">{position}</span>;
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-amber-500/50';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/50';
      case 3: return 'bg-gradient-to-r from-amber-700/20 to-amber-700/5 border-amber-700/50';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-amber-500" />
                Gamificação
              </h1>
              <p className="text-muted-foreground">Rankings, badges e conquistas dos colaboradores</p>
            </div>
          </div>

          <Tabs defaultValue="leaderboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="leaderboard" className="gap-2">
                <Trophy className="h-4 w-4" />
                Ranking
              </TabsTrigger>
              <TabsTrigger value="badges" className="gap-2">
                <Star className="h-4 w-4" />
                Badges
              </TabsTrigger>
            </TabsList>

            {/* Leaderboard */}
            <TabsContent value="leaderboard" className="space-y-6">
              {/* Period selector */}
              <div className="flex gap-2">
                <Button
                  variant={period === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('week')}
                >
                  Esta Semana
                </Button>
                <Button
                  variant={period === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('month')}
                >
                  Este Mês
                </Button>
                <Button
                  variant={period === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('all')}
                >
                  Geral
                </Button>
              </div>

              {/* Top 3 */}
              {!loadingLeaderboard && leaderboard && leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-4">
                  {/* 2nd place */}
                  <Card className="border-gray-400/50 mt-8">
                    <CardContent className="pt-6 text-center">
                      <div className="relative inline-block">
                        <Avatar className="h-16 w-16 mx-auto border-4 border-gray-400">
                          <AvatarFallback className="text-lg bg-gray-100">
                            {leaderboard[1]?.employee_name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Medal className="h-6 w-6 text-gray-400 absolute -bottom-1 -right-1" />
                      </div>
                      <h3 className="font-semibold mt-3 truncate">{leaderboard[1]?.employee_name}</h3>
                      <p className="text-2xl font-bold text-gray-500">{leaderboard[1]?.total_points}</p>
                      <p className="text-xs text-muted-foreground">pontos</p>
                    </CardContent>
                  </Card>

                  {/* 1st place */}
                  <Card className="border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent">
                    <CardContent className="pt-6 text-center">
                      <Sparkles className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                      <div className="relative inline-block">
                        <Avatar className="h-20 w-20 mx-auto border-4 border-amber-500">
                          <AvatarFallback className="text-xl bg-amber-100">
                            {leaderboard[0]?.employee_name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Crown className="h-8 w-8 text-amber-500 absolute -top-4 left-1/2 -translate-x-1/2" />
                      </div>
                      <h3 className="font-bold mt-3 text-lg truncate">{leaderboard[0]?.employee_name}</h3>
                      <p className="text-3xl font-bold text-amber-500">{leaderboard[0]?.total_points}</p>
                      <p className="text-xs text-muted-foreground">pontos</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{leaderboard[0]?.current_streak} dias</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3rd place */}
                  <Card className="border-amber-700/50 mt-8">
                    <CardContent className="pt-6 text-center">
                      <div className="relative inline-block">
                        <Avatar className="h-16 w-16 mx-auto border-4 border-amber-700">
                          <AvatarFallback className="text-lg bg-amber-100">
                            {leaderboard[2]?.employee_name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Medal className="h-6 w-6 text-amber-700 absolute -bottom-1 -right-1" />
                      </div>
                      <h3 className="font-semibold mt-3 truncate">{leaderboard[2]?.employee_name}</h3>
                      <p className="text-2xl font-bold text-amber-700">{leaderboard[2]?.total_points}</p>
                      <p className="text-xs text-muted-foreground">pontos</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Full list */}
              <Card>
                <CardHeader>
                  <CardTitle>Ranking Completo</CardTitle>
                  <CardDescription>
                    {period === 'week' && 'Pontuação desta semana'}
                    {period === 'month' && 'Pontuação deste mês'}
                    {period === 'all' && 'Pontuação total acumulada'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingLeaderboard ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard?.map((entry) => (
                        <div
                          key={entry.employee_id}
                          className={cn(
                            'flex items-center gap-4 p-3 rounded-lg border transition-colors',
                            getPositionStyle(entry.position)
                          )}
                        >
                          <div className="w-8 flex items-center justify-center">
                            {getPositionIcon(entry.position)}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {entry.employee_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{entry.employee_name}</div>
                            <div className="text-sm text-muted-foreground">
                              Nível {entry.level} • {entry.badges_count} badges
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {entry.current_streak > 0 && (
                              <div className="flex items-center gap-1 text-orange-500">
                                <Flame className="h-4 w-4" />
                                <span className="text-sm font-medium">{entry.current_streak}</span>
                              </div>
                            )}
                            <div className="text-right">
                              <div className="font-bold">{entry.total_points}</div>
                              <div className="text-xs text-muted-foreground">pts</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Badges */}
            <TabsContent value="badges" className="space-y-6">
              {loadingBadges ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                Object.entries(groupedBadges || {}).map(([category, categoryBadges]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>{categoryConfig[category as keyof typeof categoryConfig]?.icon}</span>
                        {categoryConfig[category as keyof typeof categoryConfig]?.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryBadges?.map((badge) => (
                          <div
                            key={badge.id}
                            className="p-4 rounded-lg border text-center hover:bg-accent transition-colors"
                          >
                            <div 
                              className="text-4xl mb-2"
                              style={{ filter: badge.is_secret ? 'grayscale(1) blur(4px)' : 'none' }}
                            >
                              {badge.icon}
                            </div>
                            <h4 className="font-medium text-sm">{badge.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {badge.description}
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                              <Badge 
                                variant="outline" 
                                className={cn('text-xs', rarityConfig[badge.rarity].textColor)}
                              >
                                {rarityConfig[badge.rarity].label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                +{badge.points} pts
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
