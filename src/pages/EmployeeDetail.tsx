import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Building2, Monitor } from 'lucide-react';
import { useEmployee } from '@/hooks/useEmployees';
import { Badge } from '@/components/ui/badge';

const EmployeeDetailContent = memo(function EmployeeDetailContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id!);

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;
  if (!employee) return <div className="p-6 text-center text-muted-foreground">Funcionário não encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
        <h1 className="text-2xl font-bold">{employee.name}</h1>
        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>{employee.status}</Badge>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {employee.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{employee.email}</div>}
            {employee.department && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" />{employee.department}</div>}
            {(employee as any).position && <div className="flex items-center gap-2"><Monitor className="h-4 w-4 text-muted-foreground" />{(employee as any).position}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default function EmployeeDetail() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="p-6"><Skeleton className="h-96" /></div>}>
        <EmployeeDetailContent />
      </Suspense>
    </ErrorBoundary>
  );
}
