import { useParams } from "react-router-dom";
import { useEmployee } from "@/hooks/useEmployees";
import { EmployeeHeader } from "@/components/EmployeeHeader";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: employee, isLoading } = useEmployee(id!);

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton className="h-96" />
      </div>
    );
  if (!employee) return <div className="p-6">Funcionário não encontrado</div>;

  const displayName = employee.full_name ?? (employee as { name?: string }).name ?? "Sem nome";

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayName}
        description={`Detalhes e histórico de atividades de ${displayName}.`}
      />

      <EmployeeHeader employee={employee} />

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-6">
          <ActivityTimeline employeeId={id!} />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            Funcionalidade de estatísticas detalhadas em desenvolvimento.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
