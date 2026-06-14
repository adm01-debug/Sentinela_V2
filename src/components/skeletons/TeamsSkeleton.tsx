import { memo } from 'react';
import { SkeletonPageLayout } from './SkeletonPageLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const TeamsSkeleton = memo(function TeamsSkeleton() {
  return (
    <SkeletonPageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading teams">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} style={{ opacity: 1 - i * 0.1 }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-8 w-8 rounded-full border-2 border-background" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Skeleton className="h-3 w-16 mb-1" /><Skeleton className="h-5 w-12" /></div>
                  <div><Skeleton className="h-3 w-20 mb-1" /><Skeleton className="h-5 w-16" /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <span className="sr-only">Loading teams data...</span>
      </div>
    </SkeletonPageLayout>
  );
});
