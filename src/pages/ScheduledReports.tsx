import { useScheduledReportsPage } from '@/hooks/useScheduledReportsPage';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Search, Plus, Edit, Trash2, Loader2, FileText, Calendar, Clock, Play, X, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ScheduledReports() {
  const {
    searchTerm, setSearchTerm, typeFilter, setTypeFilter,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingReport, deletingReport, setDeletingReport,
    formData, setFormData, newRecipient, setNewRecipient,
    reports, stats, isLoading,
    isCreating, isUpdating, isDeleting, isRunning,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete, handleAddRecipient, handleRemoveRecipient,
    handleRunNow, REPORT_TYPES,
  } = useScheduledReportsPage();

  const scheduleLabels: Record<string, string> = { daily: 'Diario', weekly: 'Semanal', monthly: 'Mensal' };

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader title="Relatorios Agendados" description="Configure relatorios automaticos">
        <Button onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" />Novo Agendamento</Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diarios</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.daily}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semanais</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.weekly}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensais</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.monthly}</div></CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {REPORT_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : reports.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum relatorio agendado</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  </div>
                  <Switch checked={report.is_active} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge>{REPORT_TYPES.find(t => t.value === report.report_type)?.label}</Badge>
                  <Badge variant="outline">{scheduleLabels[report.schedule]}</Badge>
                  <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  {report.last_sent && <p>Ultimo: {formatDistanceToNow(new Date(report.last_sent), { addSuffix: true, locale: ptBR })}</p>}
                  <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{report.recipients?.length || 0} destinatarios</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleRunNow(report.id)} disabled={isRunning}><Play className="h-3 w-3 mr-1" />Executar</Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(report)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { setDeletingReport(report); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReport ? 'Editar' : 'Novo'} Agendamento</DialogTitle>
            <DialogDescription>Configure o relatorio automatico</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2"><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Descricao</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={formData.report_type} onValueChange={(v) => setFormData({ ...formData, report_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{REPORT_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Formato</Label>
                <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Frequencia</Label>
                <Select value={formData.schedule} onValueChange={(v) => setFormData({ ...formData, schedule: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Horario</Label><Input type="time" value={formData.schedule_time} onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })} /></div>
            </div>
            <div className="grid gap-2">
              <Label>Destinatarios</Label>
              <div className="flex gap-2"><Input placeholder="email@exemplo.com" value={newRecipient} onChange={(e) => setNewRecipient(e.target.value)} /><Button type="button" onClick={handleAddRecipient}>Adicionar</Button></div>
              <div className="flex flex-wrap gap-2">{formData.recipients.map((email) => (<Badge key={email} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveRecipient(email)}>{email}<X className="h-3 w-3 ml-1" /></Badge>))}</div>
            </div>
            <div className="flex items-center justify-between"><Label>Ativo</Label><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>{(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingReport ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Excluir" description={`Excluir "${deletingReport?.name}"?`} onConfirm={handleDelete} isLoading={isDeleting} variant="destructive" />
    </div>
  );
}
