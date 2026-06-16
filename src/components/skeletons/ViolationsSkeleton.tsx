import { memo } from "react";
import { SkeletonPageLayout } from "./SkeletonPageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ViolationsSkeleton = memo(function ViolationsSkeleton() {
  return (
    <SkeletonPageLayout>
      <div className="animate-pulse space-y-6" role="status" aria-label="Loading violations">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {["Crítico", "Alto", "Médio", "Baixo"].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-1 h-10 w-12" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex gap-2 border-b border-border pb-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} style={{ opacity: 1 - i * 0.1 }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="mb-2 h-4 w-full" />
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <span className="sr-only">Loading violations data...</span>
      </div>
    </SkeletonPageLayout>
  );
});
