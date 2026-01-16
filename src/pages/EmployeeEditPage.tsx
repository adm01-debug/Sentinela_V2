import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button  } from '@/components/ui/button';
import { Input  } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter  } from '@/components/ui/card';
import { Skeleton } from '@/components/Skeleton';
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  department: z.string().min(1),
  role: z.string().min(1),
  status: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id!);
  const updateEmployee = useUpdateEmployee();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: employee,
  });

  const onSubmit = async (data: FormData) => {
    await updateEmployee.mutateAsync({ id: id!, ...data });
    navigate(`/employees/${id}`);
  };

  if (isLoading) return <div className="p-6"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />Voltar
      </Button>
      <Card>
        <CardHeader><CardTitle>Editar Funcionário</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Input label="Nome" {...register('name')} error={errors.name?.message} />
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Departamento" {...register('department')} error={errors.department?.message} />
            <Input label="Cargo" {...register('role')} error={errors.role?.message} />
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={employee?.status} onValueChange={v => setValue('status', v as 'active' | 'inactive')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" loading={updateEmployee.isPending}>Salvar</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
