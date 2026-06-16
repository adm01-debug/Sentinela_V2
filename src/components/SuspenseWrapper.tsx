import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

function DefaultFallback() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}

export function SuspenseWrapper({ children, fallback }: Props) {
  return <Suspense fallback={fallback || <DefaultFallback />}>{children}</Suspense>;
}
