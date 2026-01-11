import { useDashboardStats, useActivityChart, useTopEmployees } from '@/hooks';
import { StatCard } from '@/components/StatCard';
import { ActivityChart } from '@/components/ActivityChart';
import { TopEmployeesList } from '@/components/TopEmployeesList';
import { RecentAlerts } from '@/components/RecentAlerts';
import { Skeleton } from '@/components/Skeleton';

export const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activityData } = useActivityChart('week');
  const { data: topEmployees } = useTopEmployees();

  if (statsLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={stats?.totalEmployees || 0} icon="users" />
        <StatCard title="Active Now" value={stats?.activeEmployees || 0} icon="activity" trend={5} />
        <StatCard title="Productivity" value={(stats?.averageProductivity || 0) + '%'} icon="trending-up" trend={stats?.productivityTrend} />
        <StatCard title="Open Alerts" value={stats?.alertsCount || 0} icon="alert-triangle" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ActivityChart data={activityData || []} /></div>
        <div><TopEmployeesList employees={topEmployees || []} /></div>
      </div>
      <RecentAlerts />
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton width={200} height={32} />
    <div className="grid grid-cols-4 gap-6">{[1,2,3,4].map(i => <Skeleton key={i} height={100} />)}</div>
  </div>
);