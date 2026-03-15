import { useState } from 'react';
import { useActivities, useActivitySummary } from '@/hooks/useActivities';
import { ActivityFilters } from '@/components/ActivityFilters';
import { ActivityChart } from '@/components/ActivityChart';
import { ActivityTable } from '@/components/ActivityTable';
import { ApplicationBreakdown } from '@/components/ApplicationBreakdown';
import { format, subDays } from 'date-fns';

interface HourlyItem { date: string; value: number; }
interface AppBreakdown { app: string; duration: number; percentage: number; }

export const ActivitiesPage = () => {
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const { data: activities, isLoading } = useActivities(filters);
  const { data: summary } = useActivitySummary(filters);

  const summaryObj = summary as { hourlyDistribution?: HourlyItem[]; applicationBreakdown?: AppBreakdown[] } | undefined;
  const activityList = Array.isArray(activities) ? activities : ((activities as { data?: unknown[] })?.data || []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activities</h1>
      <ActivityFilters filters={filters} onChange={setFilters} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ActivityChart data={summaryObj?.hourlyDistribution || []} /></div>
        <div><ApplicationBreakdown data={summaryObj?.applicationBreakdown || []} /></div>
      </div>
      <ActivityTable activities={activityList as Parameters<typeof ActivityTable>[0]['activities']} isLoading={isLoading} />
    </div>
  );
};

export default ActivitiesPage;
