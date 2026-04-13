import { Skeleton } from '@/components/Skeleton';

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <Skeleton height={80} className="rounded-xl" />
    <div className="space-y-2">
      <Skeleton width={200} height={32} />
      <Skeleton width={320} height={16} />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="rounded-xl border bg-card p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{ animationDelay: `${i * 100}ms`, animationDuration: '400ms' }}
        >
          <div className="flex items-center justify-between">
            <Skeleton width={100} height={14} />
            <Skeleton width={36} height={36} className="rounded-lg" />
          </div>
          <Skeleton width={80} height={28} />
          <Skeleton width={140} height={12} />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      <div className="lg:col-span-4 rounded-xl border bg-card p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: '400ms', animationDuration: '400ms' }}>
        <Skeleton width={180} height={16} />
        <Skeleton height={240} className="rounded-lg" />
      </div>
      <div className="lg:col-span-3 rounded-xl border bg-card p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: '500ms', animationDuration: '400ms' }}>
        <Skeleton width={140} height={16} />
        <div className="flex items-center justify-center h-[240px]">
          <Skeleton width={180} height={180} className="rounded-full" />
        </div>
      </div>
    </div>
  </div>
);
