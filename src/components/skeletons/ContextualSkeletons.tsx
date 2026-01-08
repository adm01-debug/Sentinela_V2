import { memo } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ============================================================
// ANIMATION CONFIG
// ============================================================

const pulseVariants = {
  initial: { opacity: 0.5 },
  animate: { 
    opacity: [0.5, 1, 0.5],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
  }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

// ============================================================
// METRIC CARD SKELETON
// ============================================================

export const MetricCardSkeleton = memo(function MetricCardSkeleton() {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
          <div className="mt-4 pt-4 border-t border-border/50">
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// ============================================================
// HERO METRICS SKELETON (Dashboard)
// ============================================================

export const HeroMetricsSkeleton = memo(function HeroMetricsSkeleton() {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {[1, 2, 3, 4].map((i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </motion.div>
  );
});

// ============================================================
// TABLE SKELETON
// ============================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showActions?: boolean;
}

export const TableSkeleton = memo(function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  showHeader = true,
  showActions = true 
}: TableSkeletonProps) {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-3"
    >
      {/* Header */}
      {showHeader && (
        <motion.div variants={fadeInUp} className="flex items-center justify-between mb-4">
          <div className="flex gap-3">
            <Skeleton className="h-9 w-[200px]" />
            <Skeleton className="h-9 w-[120px]" />
          </div>
          {showActions && <Skeleton className="h-9 w-[100px]" />}
        </motion.div>
      )}

      {/* Table header */}
      <motion.div 
        variants={fadeInUp}
        className="grid gap-4 p-3 bg-muted/30 rounded-lg"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full max-w-[100px]" />
        ))}
      </motion.div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div 
          key={rowIndex}
          variants={fadeInUp}
          className="grid gap-4 p-4 border border-border/50 rounded-lg"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={`h-4 ${colIndex === 0 ? 'w-32' : 'w-full max-w-[80px]'}`} 
            />
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
});

// ============================================================
// CHART SKELETON
// ============================================================

interface ChartSkeletonProps {
  type?: 'bar' | 'line' | 'pie' | 'area';
  height?: number;
}

export const ChartSkeleton = memo(function ChartSkeleton({ 
  type = 'bar',
  height = 300 
}: ChartSkeletonProps) {
  const renderChartContent = () => {
    switch (type) {
      case 'bar':
        return (
          <div className="flex items-end justify-around h-full gap-2 px-4">
            {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
              <motion.div
                key={i}
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                style={{ height: `${h}%` }}
                className="flex-1 max-w-12 bg-primary/20 rounded-t-md"
              />
            ))}
          </div>
        );
      
      case 'line':
        return (
          <div className="relative h-full px-4">
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-4 border-b-2 border-l-2 border-dashed border-muted-foreground/20"
            />
            <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]">
              <motion.path
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                d="M 0 80 Q 50 60, 100 70 T 200 50 T 300 65 T 400 40"
                fill="none"
                stroke="hsl(var(--primary) / 0.3)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      
      case 'pie':
        return (
          <div className="flex items-center justify-center h-full">
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-8 border-muted"
            />
          </div>
        );
      
      case 'area':
        return (
          <div className="relative h-full px-4">
            <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]">
              <motion.path
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                d="M 0 100 Q 50 70, 100 80 T 200 60 T 300 75 T 400 50 V 120 H 0 Z"
                fill="hsl(var(--primary) / 0.1)"
                stroke="hsl(var(--primary) / 0.3)"
                strokeWidth="2"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="relative">
          {renderChartContent()}
        </div>
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border/50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// ============================================================
// PROFILE SKELETON
// ============================================================

export const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <Skeleton className="h-6 w-12 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
});

// ============================================================
// LIST SKELETON
// ============================================================

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

export const ListSkeleton = memo(function ListSkeleton({ 
  items = 5,
  showAvatar = true,
  showActions = true 
}: ListSkeletonProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-3"
    >
      {Array.from({ length: items }).map((_, i) => (
        <motion.div 
          key={i}
          variants={fadeInUp}
          className="flex items-center gap-4 p-4 border border-border/50 rounded-lg"
        >
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          {showActions && <Skeleton className="h-8 w-8 rounded" />}
        </motion.div>
      ))}
    </motion.div>
  );
});

// ============================================================
// FORM SKELETON
// ============================================================

interface FormSkeletonProps {
  fields?: number;
  showButtons?: boolean;
}

export const FormSkeleton = memo(function FormSkeleton({ 
  fields = 4,
  showButtons = true 
}: FormSkeletonProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {Array.from({ length: fields }).map((_, i) => (
        <motion.div key={i} variants={fadeInUp} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </motion.div>
      ))}

      {showButtons && (
        <motion.div variants={fadeInUp} className="flex justify-end gap-3 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </motion.div>
      )}
    </motion.div>
  );
});

// ============================================================
// ACTIVITY TIMELINE SKELETON
// ============================================================

interface TimelineSkeletonProps {
  items?: number;
}

export const TimelineSkeleton = memo(function TimelineSkeleton({ 
  items = 5 
}: TimelineSkeletonProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="relative pl-8 space-y-6"
    >
      {/* Vertical line */}
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
      
      {Array.from({ length: items }).map((_, i) => (
        <motion.div key={i} variants={fadeInUp} className="relative">
          {/* Dot */}
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="absolute -left-5 top-1 h-3 w-3 rounded-full bg-primary/30 ring-4 ring-background"
          />
          
          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
});

// ============================================================
// MAP SKELETON
// ============================================================

export const MapSkeleton = memo(function MapSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className="relative h-80 bg-muted/30 rounded-lg overflow-hidden"
        >
          {/* Fake map grid */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                className="border border-muted-foreground/5"
              />
            ))}
          </div>
          
          {/* Fake markers */}
          <div className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full bg-primary/30" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-primary/30" />
          <div className="absolute top-2/3 left-2/3 w-4 h-4 rounded-full bg-primary/30" />
          
          {/* Controls placeholder */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
});
