import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useCreateEmployee } from '@/hooks/useEmployees';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  department: z.string().min(1, 'Departamento obrigatório'),
  role: z.string().min(1, 'Cargo obrigatório'),
  status: z.enum(['active', 'inactive']),
});

type FormData = z.infer<typeof schema>;

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  });

  const onSubmit = async (data: FormData) => {
    await createEmployee.mutateAsync({ ...data, hireDate: new Date().toISOString() } as any);
    navigate('/employees');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />Voltar
      </Button>
      <Card>
        <CardHeader><CardTitle>Novo Funcionário</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nome</Label><Input {...register('name')} />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" {...register('email')} />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}</div>
            <div className="space-y-2"><Label>Departamento</Label><Input {...register('department')} />{errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}</div>
            <div className="space-y-2"><Label>Cargo</Label><Input {...register('role')} />{errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}</div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue="active" onValueChange={v => setValue('status', v as 'active' | 'inactive')}>
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
            <Button type="submit" disabled={createEmployee.isPending}>{createEmployee.isPending ? 'Salvando...' : 'Salvar'}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
