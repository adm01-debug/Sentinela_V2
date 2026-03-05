import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '@/services';

export default function AlertRuleCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createRule = useMutation({
    mutationFn: (data: any) => alertService.createRule ? alertService.createRule(data) : Promise.resolve(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alert-rules'] }); },
  });
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
            <div className="space-y-2">
              <Label>Nome da regra</Label>
              <Input {...register('name')} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label>Severidade</Label>
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
            <div className="space-y-2">
              <Label>Condição</Label>
              <Select onValueChange={v => setValue('condition', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle_time">Tempo ocioso</SelectItem>
                  <SelectItem value="blocked_app">App bloqueado</SelectItem>
                  <SelectItem value="unusual_activity">Atividade incomum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor limite</Label>
              <Input type="number" {...register('threshold')} />
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" disabled={createRule.isPending}>{createRule.isPending ? 'Criando...' : 'Criar Regra'}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
