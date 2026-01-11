import { useState } from 'react';
import { useActivities, useActivitySummary } from '@/hooks';
import { ActivityFilters } from '@/components/ActivityFilters';
import { ActivityChart } from '@/components/ActivityChart';
import { ActivityTable } from '@/components/ActivityTable';
import { ApplicationBreakdown } from '@/components/ApplicationBreakdown';
import { format, subDays } from 'date-fns';

export const ActivitiesPage = () => {
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const { data: activities, isLoading } = useActivities(filters);
  const { data: summary } = useActivitySummary(filters);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activities</h1>
      <ActivityFilters filters={filters} onChange={setFilters} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ActivityChart data={summary?.hourlyDistribution || []} /></div>
        <div><ApplicationBreakdown data={summary?.applicationBreakdown || []} /></div>
      </div>
      <ActivityTable activities={activities?.data || []} isLoading={isLoading} />
    </div>
  );
};