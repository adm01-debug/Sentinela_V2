import { memo } from "react";
import { SkeletonPageLayout } from "./SkeletonPageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const GeofencingSkeleton = memo(function GeofencingSkeleton() {
  return (
    <SkeletonPageLayout>
      <div className="animate-pulse space-y-6" role="status" aria-label="Loading geofencing">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="mb-1 h-6 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-1">
            <CardContent className="p-0">
              <Skeleton className="h-96 w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="mb-1 h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <span className="sr-only">Loading geofencing data...</span>
      </div>
    </SkeletonPageLayout>
  );
});
