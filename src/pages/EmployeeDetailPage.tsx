import { useParams } from 'react-router-dom';
import { useEmployee, useEmployeeStats, useScreenshots } from '@/hooks';
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { EmployeeStats } from '@/components/EmployeeStats';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { ScreenshotGallery } from '@/components/ScreenshotGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui/tabs';
import { Skeleton } from '@/components/Skeleton';
import { format, subDays } from 'date-fns';

export const EmployeeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: employee, isLoading } = useEmployee(id!);
  const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const { data: stats } = useEmployeeStats(id!, startDate, endDate);
  const { data: screenshots } = useScreenshots(id!, endDate);

  if (isLoading) return <Skeleton height={400} />;
  if (!employee) return <div>Employee not found</div>;

  return (
    <div className="space-y-6">
      <EmployeeHeader employee={employee} />
      <EmployeeStats stats={stats} />
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
        </TabsList>
        <TabsContent value="activity"><ActivityTimeline employeeId={id!} /></TabsContent>
        <TabsContent value="screenshots"><ScreenshotGallery screenshots={screenshots || []} /></TabsContent>
      </Tabs>
    </div>
  );
};