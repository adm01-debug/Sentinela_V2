import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button  } from '@/components/ui/button';
import { Input  } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter  } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/DatePicker';
import { useCreateReport } from '@/hooks/useReports';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  type: z.enum(['productivity', 'activity', 'summary', 'custom']),
  startDate: z.date(),
  endDate: z.date(),
});

type FormData = z.infer<typeof schema>;

export default function ReportCreatePage() {
  const navigate = useNavigate();
  const createReport = useCreateReport();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await createReport.mutateAsync(data);
    navigate('/reports');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
      <Card>
        <CardHeader><CardTitle>Criar Relatório</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Input label="Nome do relatório" {...register('name')} error={errors.name?.message} />
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select onValueChange={v => setValue('type', v as any)}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="productivity">Produtividade</SelectItem>
                  <SelectItem value="activity">Atividades</SelectItem>
                  <SelectItem value="summary">Resumo</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Data inicial</label><DatePicker date={watch('startDate')} onDateChange={d => d && setValue('startDate', d)} /></div>
              <div><label className="text-sm font-medium">Data final</label><DatePicker date={watch('endDate')} onDateChange={d => d && setValue('endDate', d)} /></div>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" loading={createReport.isPending}>Gerar Relatório</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
