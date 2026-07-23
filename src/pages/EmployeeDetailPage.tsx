import { useParams } from 'react-router-dom';
import { useEmployee, useEmployeeStats, type EmployeeWithDetails } from '@/hooks/useEmployees';
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { DailyJourneyTimeline } from '@/components/timeline/DailyJourneyTimeline';
import { useDailyJourney } from '@/hooks/useDailyJourney';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/Skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { format, subDays } from 'date-fns';


export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: employeeRaw, isLoading } = useEmployee(id!);
  const employee = employeeRaw as EmployeeWithDetails | undefined;
  const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: stats } = useEmployeeStats(id!, startDate, endDate);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!employee) return <div className="p-6">Funcionário não encontrado</div>;

  const displayName = employee.full_name ?? employee.name ?? 'Sem nome';

  // Eventos reais do dia: presença (time_entries) + violações (security_violations).
  const { data: journeyEvents = [] } = useDailyJourney(id!, today);


  return (
    <div className="space-y-6">
      <PageHeader
        title={displayName}
        description={`Detalhes e histórico de atividades de ${displayName}.`}
      />

      <EmployeeHeader employee={employee} />

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[540px]">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="journey">Jornada</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-6">
          <ActivityTimeline employeeId={id!} />
        </TabsContent>
        <TabsContent value="journey" className="mt-6">
          <DailyJourneyTimeline date={today} events={journeyEvents} />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <div className="bg-card border rounded-lg p-12 text-center text-muted-foreground">
            {stats ? 'Estatísticas em desenvolvimento.' : 'Sem estatísticas no período.'}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
