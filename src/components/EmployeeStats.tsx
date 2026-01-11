import { EmployeeStats as Stats } from '@/types';
import { StatCard } from './StatCard';

interface Props { stats?: Stats; }

export const EmployeeStats = ({ stats }: Props) => {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard title="Total Hours" value={stats.totalHours.toFixed(1) + 'h'} icon="activity" />
      <StatCard title="Productivity" value={stats.productivity + '%'} icon="trending-up" />
      <StatCard title="Active Time" value={stats.activeTime.toFixed(1) + 'h'} icon="users" />
      <StatCard title="Idle Time" value={stats.idleTime.toFixed(1) + 'h'} icon="alert-triangle" />
    </div>
  );
};