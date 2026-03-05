import { useQuery } from '@tanstack/react-query';
import { Users, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { ActivityChart } from '@/components/ActivityChart';
import { TopEmployeesList } from '@/components/TopEmployeesList';
import { RecentAlerts } from '@/components/RecentAlerts';
import { Skeleton } from '@/components/Skeleton';

export const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats-page'],
    queryFn: async () => ({
      totalEmployees: 0,
      activeEmployees: 0,
      averageProductivity: 0,
      productivityTrend: 0,
      alertsCount: 0,
    }),
  });
  const { data: activityData } = useQuery({
    queryKey: ['activity-chart', 'week'],
    queryFn: async () => [] as any[],
  });
  const { data: topEmployees } = useQuery({
    queryKey: ['top-employees'],
    queryFn: async () => [] as any[],
  });

  if (statsLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={stats?.totalEmployees || 0} icon={Users} />
        <StatCard title="Active Now" value={stats?.activeEmployees || 0} icon={Activity} trend={{ value: 5 }} />
        <StatCard title="Productivity" value={(stats?.averageProductivity || 0) + '%'} icon={TrendingUp} trend={{ value: stats?.productivityTrend || 0 }} />
        <StatCard title="Open Alerts" value={stats?.alertsCount || 0} icon={AlertTriangle} />
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

export default DashboardPage;
