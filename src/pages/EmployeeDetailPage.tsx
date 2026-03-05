import { useParams } from 'react-router-dom';
import { useEmployee, useEmployeeStats } from '@/hooks/useEmployees';
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/Skeleton';
import { format, subDays } from 'date-fns';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: employee, isLoading } = useEmployee(id!);
  const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const { data: stats } = useEmployeeStats(id!, startDate, endDate);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!employee) return <div className="p-6">Funcionário não encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      <EmployeeHeader employee={employee} />
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline">
          <ActivityTimeline employeeId={id!} />
        </TabsContent>
        <TabsContent value="stats">
          <div className="text-muted-foreground">Dados de estatísticas</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
