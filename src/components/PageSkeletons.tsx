import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

// ============================================================
// LAYOUT WRAPPER WITH SIDEBAR
// ============================================================

function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main id="main-content" className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// EMPLOYEES PAGE SKELETON
// ============================================================

export const EmployeesSkeleton = memo(function EmployeesSkeleton() {
  return (
    <PageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading employees">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="presentation">
                <thead>
                  <tr className="border-b border-border">
                    {['', 'Funcionário', 'Status', 'Departamento', 'Última Atividade', 'Ações'].map((_, i) => (
                      <th key={i} className="p-4 text-left">
                        <Skeleton className="h-4 w-24" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                    <tr key={row} className="border-b border-border" style={{ opacity: 1 - row * 0.08 }}>
                      <td className="p-4"><Skeleton className="h-4 w-4" /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="p-4"><Skeleton className="h-8 w-8 rounded" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <span className="sr-only">Loading employees data...</span>
      </div>
    </PageLayout>
  );
});

// ============================================================
// VIOLATIONS PAGE SKELETON
// ============================================================

export const ViolationsSkeleton = memo(function ViolationsSkeleton() {
  return (
    <PageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading violations">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Severity Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['Crítico', 'Alto', 'Médio', 'Baixo'].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Violation Cards */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} style={{ opacity: 1 - i * 0.1 }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
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
    </PageLayout>
  );
});

// ============================================================
// MONITORING PAGE SKELETON
// ============================================================

export const MonitoringSkeleton = memo(function MonitoringSkeleton() {
  return (
    <PageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading monitoring">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-6 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-end justify-between gap-2 px-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className="flex-1" 
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Employees */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Screenshots Grid */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-video rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <span className="sr-only">Loading monitoring data...</span>
      </div>
    </PageLayout>
  );
});

// ============================================================
// SETTINGS PAGE SKELETON
// ============================================================

export const SettingsSkeleton = memo(function SettingsSkeleton() {
  return (
    <PageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading settings">
        {/* Header */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>

        {/* Settings Form */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        <span className="sr-only">Loading settings...</span>
      </div>
    </PageLayout>
  );
});

// ============================================================
// TEAMS PAGE SKELETON
// ============================================================

export const TeamsSkeleton = memo(function TeamsSkeleton() {
  return (
    <PageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading teams">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Teams Grid */}
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
                  <div>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <span className="sr-only">Loading teams data...</span>
      </div>
    </PageLayout>
  );
});

// ============================================================
// EMPLOYEE DETAIL SKELETON
// ============================================================

export const EmployeeDetailSkeleton = memo(function EmployeeDetailSkeleton() {
  return (
    <PageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading employee details">
        {/* Back Button */}
        <Skeleton className="h-10 w-24" />

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded" />
                <Skeleton className="h-10 w-10 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className="flex-1" 
                    style={{ height: `${Math.random() * 60 + 40}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <span className="sr-only">Loading employee details...</span>
      </div>
    </PageLayout>
  );
});

// ============================================================
// GEOFENCING PAGE SKELETON
// ============================================================

export const GeofencingSkeleton = memo(function GeofencingSkeleton() {
  return (
    <PageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading geofencing">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-6 w-12 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map and List */}
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
                <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
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
    </PageLayout>
  );
});

// ============================================================
// REPORTS PAGE SKELETON
// ============================================================

export const ReportsSkeleton = memo(function ReportsSkeleton() {
  return (
    <PageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading reports">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div>
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <span className="sr-only">Loading reports...</span>
      </div>
    </PageLayout>
  );
});

// ============================================================
// GAMIFICATION PAGE SKELETON
// ============================================================

export const GamificationSkeleton = memo(function GamificationSkeleton() {
  return (
    <PageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading gamification">
        {/* Header */}
        <div>
          <Skeleton className="h-8 w-44 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
                <Skeleton className="h-6 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leaderboard and Badges */}
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
                    <Skeleton className="h-4 w-32 mb-1" />
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
                    <Skeleton className="h-12 w-12 rounded-lg mx-auto mb-2" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <span className="sr-only">Loading gamification data...</span>
      </div>
    </PageLayout>
  );
});

// ============================================================
// DEVICES PAGE SKELETON
// ============================================================

export const DevicesSkeleton = memo(function DevicesSkeleton() {
  return (
    <PageLayout>
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading devices">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-6 w-12 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Devices Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} style={{ opacity: 1 - i * 0.1 }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <span className="sr-only">Loading devices data...</span>
      </div>
    </PageLayout>
  );
});
