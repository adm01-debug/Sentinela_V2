import { useState } from 'react';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { Button  } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent  } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui/select';
import { Input  } from '@/components/ui/input';
import { Switch  } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter  } from '@/components/ui/dialog';
import { useScheduledReports, useCreateSchedule, useDeleteSchedule } from '@/hooks/useReports';

export default function ReportSchedulePage() {
  const [open, setOpen] = useState(false);
  const { data: schedules, isLoading } = useScheduledReports();
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();

  const [form, setForm] = useState({ name: '', type: '', frequency: '', time: '', recipients: '' });

  const handleCreate = async () => {
    await createSchedule.mutateAsync(form);
    setOpen(false);
    setForm({ name: '', type: '', frequency: '', time: '', recipients: '' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios Agendados</h1>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Novo Agendamento</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedules?.map(schedule => (
          <Card key={schedule.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{schedule.name}</CardTitle>
              <Switch checked={schedule.active} />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{schedule.frequency}</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{schedule.time}</div>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 text-destructive" onClick={() => deleteSchedule.mutate(schedule.id)}>
                <Trash2 className="mr-2 h-4 w-4" />Remover
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input label="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue placeholder="Tipo de relatório" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="productivity">Produtividade</SelectItem>
                <SelectItem value="activity">Atividades</SelectItem>
                <SelectItem value="summary">Resumo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
              <SelectTrigger><SelectValue placeholder="Frequência" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
            <Input label="Horário" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            <Input label="Destinatários (emails)" value={form.recipients} onChange={e => setForm(f => ({ ...f, recipients: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} loading={createSchedule.isPending}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
