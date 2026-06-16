import { memo } from "react";
import { SkeletonPageLayout } from "./SkeletonPageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const GamificationSkeleton = memo(function GamificationSkeleton() {
  return (
    <SkeletonPageLayout>
      <div className="animate-pulse space-y-6" role="status" aria-label="Loading gamification">
        <div>
          <Skeleton className="mb-2 h-8 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <Skeleton className="mx-auto mb-2 h-12 w-12 rounded-full" />
                <Skeleton className="mx-auto mb-1 h-6 w-16" />
                <Skeleton className="mx-auto h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="mx-auto mb-2 h-12 w-12 rounded-lg" />
                    <Skeleton className="mx-auto h-3 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <span className="sr-only">Loading gamification data...</span>
      </div>
    </SkeletonPageLayout>
  );
});
