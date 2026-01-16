import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button  } from '@/components/ui/button';
import { Input  } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter  } from '@/components/ui/card';
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
    await createEmployee.mutateAsync(data);
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
            <Input label="Nome" {...register('name')} error={errors.name?.message} />
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Departamento" {...register('department')} error={errors.department?.message} />
            <Input label="Cargo" {...register('role')} error={errors.role?.message} />
            <div>
              <label className="text-sm font-medium">Status</label>
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
            <Button type="submit" loading={createEmployee.isPending}>Salvar</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
