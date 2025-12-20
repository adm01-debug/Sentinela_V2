import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { useDashboardPage } from '@/hooks/useDashboardPage';
import { DashboardStats, RecentViolations, RecentActivity } from '@/components/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

const DashboardContent = React.memo(function DashboardContent() {
  const { t } = useTranslation();
  const { stats, recentViolations, recentActivity, isLoading } = useDashboardPage();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <DashboardStats {...stats} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentViolations violations={recentViolations} />
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
});

export default function Index() {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSkeleton />}>
          <DashboardContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
