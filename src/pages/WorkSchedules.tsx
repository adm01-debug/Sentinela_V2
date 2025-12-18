import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  Users, 
  Calendar,
  Trash2,
  Edit2,
  Loader2,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Timer,
  Coffee,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useWorkSchedules, getDayName, getDayShort, WorkSchedule } from '@/hooks/useWorkSchedules';
import { useEmployees } from '@/hooks/useEmployees';
import { useOvertimeNotifications } from '@/hooks/useOvertimeNotifications';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WEEKDAYS = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export default function WorkSchedules() {
  const navigate = useNavigate();
  const { 
    schedules, 
    employeeSchedules, 
    overtimeRequests,
    blockLogs,
    loading, 
    addSchedule, 
    updateSchedule, 
    deleteSchedule,
    assignSchedule,
    removeEmployeeSchedule,
    updateOvertimeRequest
  } = useWorkSchedules();
  const { employees } = useEmployees();
  
  // Enable realtime notifications for overtime requests
  useOvertimeNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('schedules');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    work_days: [1, 2, 3, 4, 5] as number[],
    start_time: '08:00',
    end_time: '18:00',
    lunch_start: '12:00',
    lunch_end: '13:00',
    allow_overtime: false,
    auto_block_enabled: true,
    grace_period_minutes: 5
  });

  // Assign form state
  const [assignForm, setAssignForm] = useState({
    employee_id: '',
    schedule_id: '',
    effective_from: new Date().toISOString().split('T')[0]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      work_days: [1, 2, 3, 4, 5],
      start_time: '08:00',
      end_time: '18:00',
      lunch_start: '12:00',
      lunch_end: '13:00',
      allow_overtime: false,
      auto_block_enabled: true,
      grace_period_minutes: 5
    });
    setEditingSchedule(null);
  };

  const openEditDialog = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      description: schedule.description || '',
      work_days: schedule.work_days,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      lunch_start: schedule.lunch_start || '',
      lunch_end: schedule.lunch_end || '',
      allow_overtime: schedule.allow_overtime,
      auto_block_enabled: schedule.auto_block_enabled,
      grace_period_minutes: schedule.grace_period_minutes
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const data = {
      ...formData,
      lunch_start: formData.lunch_start || null,
      lunch_end: formData.lunch_end || null
    };

    if (editingSchedule) {
      updateSchedule({ id: editingSchedule.id, ...data });
    } else {
      addSchedule(data);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleAssign = () => {
    if (!assignForm.employee_id || !assignForm.schedule_id) return;
    assignSchedule(assignForm);
    setAssignDialogOpen(false);
    setAssignForm({ employee_id: '', schedule_id: '', effective_from: new Date().toISOString().split('T')[0] });
  };

  const toggleWorkDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      work_days: prev.work_days.includes(day)
        ? prev.work_days.filter(d => d !== day)
        : [...prev.work_days, day].sort()
    }));
  };

  const pendingRequests = overtimeRequests.filter(r => r.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/settings')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Jornadas de Trabalho</h1>
            <p className="text-sm text-muted-foreground">Configure horários e bloqueio automático</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAssignDialogOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Atribuir
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Jornada
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Jornadas</span>
            </div>
            <p className="text-2xl font-bold">{schedules.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-success" />
              <span className="text-sm text-muted-foreground">Atribuições</span>
            </div>
            <p className="text-2xl font-bold">{employeeSchedules.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-4 w-4 text-warning" />
              <span className="text-sm text-muted-foreground">Hora Extra Pendente</span>
            </div>
            <p className="text-2xl font-bold">{pendingRequests.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Bloqueios Hoje</span>
            </div>
            <p className="text-2xl font-bold">
              {blockLogs.filter(l => 
                new Date(l.blocked_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="schedules" className="gap-2">
              <Clock className="h-4 w-4" />
              Jornadas
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <Users className="h-4 w-4" />
              Atribuições
            </TabsTrigger>
            <TabsTrigger value="overtime" className="gap-2">
              <Timer className="h-4 w-4" />
              Hora Extra
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Lock className="h-4 w-4" />
              Log de Bloqueios
            </TabsTrigger>
          </TabsList>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="mt-4">
            <div className="rounded-xl border border-border bg-card">
              {schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma jornada cadastrada</p>
                  <Button variant="link" onClick={() => setDialogOpen(true)}>
                    Criar primeira jornada
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {schedules.map(schedule => (
                    <div key={schedule.id} className="p-4 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{schedule.name}</span>
                          {schedule.auto_block_enabled ? (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                              <Lock className="h-3 w-3 mr-1" />
                              Auto-bloqueio
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Unlock className="h-3 w-3 mr-1" />
                              Sem bloqueio
                            </Badge>
                          )}
                          {schedule.allow_overtime && (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                              Hora extra permitida
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                          {schedule.lunch_start && schedule.lunch_end && (
                            <span className="flex items-center gap-1">
                              <Coffee className="h-3 w-3" />
                              {schedule.lunch_start} - {schedule.lunch_end}
                            </span>
                          )}
                          <span>
                            {schedule.work_days.map(d => getDayShort(d)).join(', ')}
                          </span>
                        </div>
                        {schedule.description && (
                          <p className="text-xs text-muted-foreground mt-1">{schedule.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(schedule)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteSchedule(schedule.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="mt-4">
            <div className="rounded-xl border border-border bg-card">
              {employeeSchedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma atribuição de jornada</p>
                  <Button variant="link" onClick={() => setAssignDialogOpen(true)}>
                    Atribuir jornada a colaborador
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {employeeSchedules.map(assignment => (
                    <div key={assignment.id} className="p-4 flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{assignment.employee?.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{assignment.schedule?.name}</span>
                          <span>•</span>
                          <span>{assignment.schedule?.start_time} - {assignment.schedule?.end_time}</span>
                        </div>
                      </div>

                      <div className="text-right text-sm text-muted-foreground">
                        <p>Desde: {format(new Date(assignment.effective_from), 'dd/MM/yyyy')}</p>
                        {assignment.effective_until && (
                          <p>Até: {format(new Date(assignment.effective_until), 'dd/MM/yyyy')}</p>
                        )}
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeEmployeeSchedule(assignment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Overtime Tab */}
          <TabsContent value="overtime" className="mt-4">
            <div className="rounded-xl border border-border bg-card">
              {overtimeRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Timer className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma solicitação de hora extra</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {overtimeRequests.map(request => (
                    <div key={request.id} className="p-4 flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        request.status === 'pending' ? 'bg-warning/10' :
                        request.status === 'approved' ? 'bg-success/10' : 'bg-destructive/10'
                      }`}>
                        {request.status === 'pending' ? (
                          <AlertTriangle className="h-5 w-5 text-warning" />
                        ) : request.status === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{request.employee?.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{format(new Date(request.requested_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          <span>•</span>
                          <span>{request.start_time} - {request.end_time}</span>
                        </div>
                        {request.reason && (
                          <p className="text-xs text-muted-foreground mt-1">{request.reason}</p>
                        )}
                      </div>

                      <Badge variant={
                        request.status === 'pending' ? 'secondary' :
                        request.status === 'approved' ? 'default' : 'destructive'
                      }>
                        {request.status === 'pending' ? 'Pendente' :
                         request.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                      </Badge>

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="text-success border-success/30"
                            onClick={() => updateOvertimeRequest({ id: request.id, status: 'approved' })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/30"
                            onClick={() => updateOvertimeRequest({ id: request.id, status: 'rejected' })}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Block Logs Tab */}
          <TabsContent value="logs" className="mt-4">
            <div className="rounded-xl border border-border bg-card">
              {blockLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Lock className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhum registro de bloqueio</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {blockLogs.map(log => (
                    <div key={log.id} className="p-4 flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        log.block_type === 'unblocked' ? 'bg-success/10' : 'bg-destructive/10'
                      }`}>
                        {log.block_type === 'unblocked' ? (
                          <Unlock className="h-5 w-5 text-success" />
                        ) : (
                          <Lock className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{log.employee_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{log.device || 'Dispositivo desconhecido'}</span>
                          {log.reason && (
                            <>
                              <span>•</span>
                              <span>{log.reason}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-sm text-muted-foreground">
                        <p>{format(new Date(log.blocked_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                        {log.unblocked_at && (
                          <p className="text-success">
                            Desbloqueado: {format(new Date(log.unblocked_at), 'HH:mm')}
                          </p>
                        )}
                      </div>

                      <Badge variant={log.block_type === 'unblocked' ? 'default' : 'destructive'}>
                        {log.block_type === 'auto_blocked' ? 'Auto-bloqueio' :
                         log.block_type === 'manual_blocked' ? 'Manual' : 'Desbloqueado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create/Edit Schedule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? 'Editar Jornada' : 'Nova Jornada de Trabalho'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Nome da Jornada</Label>
              <Input
                placeholder="Ex: Comercial, Administrativo, TI..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                placeholder="Descreva esta jornada..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Dias de Trabalho</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map(day => (
                  <label
                    key={day.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.work_days.includes(day.value)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <Checkbox
                      checked={formData.work_days.includes(day.value)}
                      onCheckedChange={() => toggleWorkDay(day.value)}
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Início</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora Fim</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início Almoço (opcional)</Label>
                <Input
                  type="time"
                  value={formData.lunch_start}
                  onChange={(e) => setFormData(prev => ({ ...prev, lunch_start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Fim Almoço (opcional)</Label>
                <Input
                  type="time"
                  value={formData.lunch_end}
                  onChange={(e) => setFormData(prev => ({ ...prev, lunch_end: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Período de Tolerância (minutos)</Label>
              <Input
                type="number"
                min="0"
                max="60"
                value={formData.grace_period_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, grace_period_minutes: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Bloqueio Automático</Label>
                  <p className="text-xs text-muted-foreground">Bloqueia estação fora do horário</p>
                </div>
                <Switch
                  checked={formData.auto_block_enabled}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, auto_block_enabled: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Permitir Hora Extra</Label>
                  <p className="text-xs text-muted-foreground">Colaborador pode solicitar extensão</p>
                </div>
                <Switch
                  checked={formData.allow_overtime}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, allow_overtime: v }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
              {editingSchedule ? 'Salvar' : 'Criar Jornada'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Schedule Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Atribuir Jornada a Colaborador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Colaborador</Label>
              <Select
                value={assignForm.employee_id}
                onValueChange={(v) => setAssignForm(prev => ({ ...prev, employee_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jornada</Label>
              <Select
                value={assignForm.schedule_id}
                onValueChange={(v) => setAssignForm(prev => ({ ...prev, schedule_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma jornada" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map(schedule => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.name} ({schedule.start_time} - {schedule.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vigência a partir de</Label>
              <Input
                type="date"
                value={assignForm.effective_from}
                onChange={(e) => setAssignForm(prev => ({ ...prev, effective_from: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!assignForm.employee_id || !assignForm.schedule_id}
            >
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
