import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/Skeleton';
import { useDepartment } from '@/hooks/useDepartments';

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: dept, isLoading } = useDepartment(id!);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!dept) return <div className="p-6">Departamento não encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button><Building className="h-6 w-6" /><h1 className="text-2xl font-bold">{dept.name}</h1></div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card><CardContent className="pt-6 text-center"><Users className="h-8 w-8 mx-auto text-muted-foreground" /><p className="text-3xl font-bold mt-2">{dept.employee_count || 0}</p><p className="text-muted-foreground">Funcionários</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><TrendingUp className="h-8 w-8 mx-auto text-green-500" /><p className="text-3xl font-bold mt-2">N/A</p><p className="text-muted-foreground">Produtividade</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">N/A</p><p className="text-muted-foreground">Horas ativas hoje</p></CardContent></Card>
      </div>
      {dept.description && (
        <Card><CardHeader><CardTitle>Descrição</CardTitle></CardHeader><CardContent><p>{dept.description}</p></CardContent></Card>
      )}
    </div>
  );
}
