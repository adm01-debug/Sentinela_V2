import React from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

interface SkeletonCardProps {
  hasAvatar?: boolean;
  lines?: number;
}

export function SkeletonCard({ hasAvatar = true, lines = 3 }: SkeletonCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        {hasAvatar && <Skeleton className="h-12 w-12 rounded-full" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" style={{ width: `${100 - i * 10}%` }} />
        ))}
      </CardContent>
    </Card>
  );
}
