import { useParams } from "react-router-dom";
import { Users, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/Skeleton";
import { useDepartment } from "@/hooks/useDepartments";

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: dept, isLoading } = useDepartment(id!);

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton className="h-96" />
      </div>
    );
  if (!dept) return <div className="p-6">Departamento não encontrado</div>;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={dept.name} showBackButton={true} />
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-3xl font-bold">{dept.employee_count || 0}</p>
            <p className="text-muted-foreground">Funcionários</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 text-3xl font-bold">N/A</p>
            <p className="text-muted-foreground">Produtividade</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">N/A</p>
            <p className="text-muted-foreground">Horas ativas hoje</p>
          </CardContent>
        </Card>
      </div>
      {dept.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{dept.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
