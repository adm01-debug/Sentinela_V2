import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, subDays } from 'date-fns';
import { useActivities } from '@/hooks/useActivities';
import { useActivitySummary } from '@/hooks/useActivitySummary';
import { ActivityFilters } from '@/components/ActivityFilters';
import { ActivityChart } from '@/components/ActivityChart';
import { ActivityTable } from '@/components/ActivityTable';
import { AnomalyDetectionPanel } from '@/components/AnomalyDetectionPanel';
import { ApplicationBreakdown } from '@/components/ApplicationBreakdown';
import { PageHeader } from '@/components/layout/PageHeader';
import { XlsxExportButton } from '@/components/exports/XlsxExportButton';


export const ActivitiesPage = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const { data: activities, isLoading } = useActivities(filters);
  const { summary } = useActivitySummary({ startDate: filters.startDate, endDate: filters.endDate });

  const hourlyData = (summary?.hourlyDistribution ?? []).map((item) => ({
    date: `${String(item.hour).padStart(2, '0')}h`,
    value: item.count,
  }));
  const appsData = (summary?.topApplications ?? []).map((app) => ({
    app: app.name,
    duration: app.count,
    percentage: app.percentage,
  }));
  const activityList = Array.isArray(activities) ? activities : ((activities as { data?: unknown[] })?.data || []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.activities')}
        description="Visualize e analise todas as atividades registradas no sistema."
        showBackButton={false}
        actions={
          <XlsxExportButton
            filename="atividades"
            sheets={[{
              name: 'Atividades',
              rows: (activityList as Array<Record<string, unknown>>).map(a => ({ ...a })),
            }]}
            disabled={activityList.length === 0}
          />
        }
      />
      <ActivityFilters filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ActivityChart data={hourlyData} /></div>
        <div><ApplicationBreakdown data={appsData} /></div>
      </div>

      <AnomalyDetectionPanel />

      <ActivityTable activities={activityList as Parameters<typeof ActivityTable>[0]['activities']} isLoading={isLoading} />
    </div>
  );
};

export default ActivitiesPage;
