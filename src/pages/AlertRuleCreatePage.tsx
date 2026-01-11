import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateAlertRule } from '@/hooks/useAlerts';

export default function AlertRuleCreatePage() {
  const navigate = useNavigate();
  const createRule = useCreateAlertRule();
  const { register, handleSubmit, setValue } = useForm();

  const onSubmit = async (data: any) => {
    await createRule.mutateAsync(data);
    navigate('/alerts/rules');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
      <Card>
        <CardHeader><CardTitle>Nova Regra de Alerta</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Input label="Nome da regra" {...register('name')} />
            <Textarea label="Descrição" {...register('description')} />
            <div><label className="text-sm font-medium">Severidade</label>
              <Select onValueChange={v => setValue('severity', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Condição</label>
              <Select onValueChange={v => setValue('condition', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle_time">Tempo ocioso</SelectItem>
                  <SelectItem value="blocked_app">App bloqueado</SelectItem>
                  <SelectItem value="unusual_activity">Atividade incomum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input label="Valor limite" type="number" {...register('threshold')} />
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" loading={createRule.isPending}>Criar Regra</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}