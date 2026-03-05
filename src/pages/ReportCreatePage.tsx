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
import { DatePicker } from '@/components/ui/DatePicker';
import { useGenerateReport } from '@/hooks/useReports';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  type: z.enum(['productivity', 'activity', 'summary', 'custom']),
  startDate: z.date(),
  endDate: z.date(),
});

type FormData = z.infer<typeof schema>;

export default function ReportCreatePage() {
  const navigate = useNavigate();
  const generateReport = useGenerateReport();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await generateReport.mutateAsync({
      type: data.type as any,
      filters: {
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      },
    });
    navigate('/reports');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
      <Card>
        <CardHeader><CardTitle>Criar Relatório</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do relatório</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
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
              <div className="space-y-2"><Label>Data inicial</Label><DatePicker date={watch('startDate')} onDateChange={d => d && setValue('startDate', d)} /></div>
              <div className="space-y-2"><Label>Data final</Label><DatePicker date={watch('endDate')} onDateChange={d => d && setValue('endDate', d)} /></div>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" disabled={generateReport.isPending}>
              {generateReport.isPending ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
