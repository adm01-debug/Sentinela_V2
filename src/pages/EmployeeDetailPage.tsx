import { useParams } from 'react-router-dom';
import { useEmployee, useEmployeeStats } from '@/hooks/useEmployees';
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/Skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { format, subDays } from 'date-fns';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: employee, isLoading } = useEmployee(id!);
  const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const { data: stats } = useEmployeeStats(id!, startDate, endDate);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!employee) return <div className="p-6">Funcionário não encontrado</div>;

  const displayName = (employee as any).full_name ?? (employee as any).name ?? 'Sem nome';

  return (
    <div className="space-y-6">
      <PageHeader 
        title={displayName} 
        description={`Detalhes e histórico de atividades de ${displayName}.`}
      />
      
      <EmployeeHeader employee={employee as any} />
      
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-6">
          <ActivityTimeline employeeId={id!} />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <div className="bg-card border rounded-lg p-12 text-center text-muted-foreground">
            Funcionalidade de estatísticas detalhadas em desenvolvimento.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
