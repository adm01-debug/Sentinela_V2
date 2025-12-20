import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { useGamificationPage } from '@/hooks/useGamificationPage';
import { GamificationStats, Leaderboard } from '@/components/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Award } from 'lucide-react';

function ErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6 text-center">
        <Button onClick={resetErrorBoundary}>{t('common.refresh')}</Button>
      </CardContent>
    </Card>
  );
}

const GamificationContent = React.memo(function GamificationContent() {
  const { t } = useTranslation();
  const { leaderboard, achievements, stats, period, isLoading, handlePeriodChange } = useGamificationPage();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GamificationStats {...stats} />
      
      <div className="flex justify-end">
        <Select value={period} onValueChange={(v) => handlePeriodChange(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t('time.thisWeek')}</SelectItem>
            <SelectItem value="month">{t('time.thisMonth')}</SelectItem>
            <SelectItem value="all">{t('common.all')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Leaderboard entries={leaderboard} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {t('gamification.badges')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                  <span className="text-sm font-medium text-yellow-500">+{a.points}</span>
                </div>
              ))}
              {achievements.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  {t('gamification.noBadges')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default function Gamification() {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('gamification.title')}</h1>
        <p className="text-muted-foreground">{t('gamification.subtitle')}</p>
      </div>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <GamificationContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
