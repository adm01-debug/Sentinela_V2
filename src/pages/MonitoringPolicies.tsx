import { useMonitoringPoliciesPage } from '@/hooks/useMonitoringPoliciesPage';
import { PolicyCard } from '@/components/policies';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Search, Plus, Loader2, Shield, Camera, MapPin, Activity } from 'lucide-react';

export default function MonitoringPolicies() {
  const {
    searchTerm, setSearchTerm,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingPolicy, deletingPolicy, setDeletingPolicy,
    formData, setFormData,
    policies, stats, isLoading,
    isCreating, isUpdating, isDeleting,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete,
  } = useMonitoringPoliciesPage();

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader title="Politicas de Monitoramento" description="Configure como os funcionarios sao monitorados">
        <Button onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" />Nova Politica</Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle><Shield className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ativas</CardTitle><Activity className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.active}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Com Screenshots</CardTitle><Camera className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.withScreenshots}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Com GPS</CardTitle><MapPin className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.withLocation}</div></CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar politicas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : policies.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-muted-foreground"><Shield className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma politica encontrada</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((p) => (<PolicyCard key={p.id} policy={p} onEdit={handleOpenEdit} onDelete={(policy) => { setDeletingPolicy(policy); setIsDeleteDialogOpen(true); }} />))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? 'Editar' : 'Nova'} Politica</DialogTitle>
            <DialogDescription>Configure os parametros de monitoramento</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Descricao</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="grid gap-2">
              <Label>Intervalo de Screenshots ({formData.screenshot_interval / 60} min)</Label>
              <Slider value={[formData.screenshot_interval]} onValueChange={([v]) => setFormData({ ...formData, screenshot_interval: v })} min={0} max={1800} step={60} />
              <p className="text-xs text-muted-foreground">0 = desativado</p>
            </div>
            <div className="grid gap-2">
              <Label>Tempo de Ociosidade ({formData.idle_threshold / 60} min)</Label>
              <Slider value={[formData.idle_threshold]} onValueChange={([v]) => setFormData({ ...formData, idle_threshold: v })} min={60} max={1800} step={60} />
            </div>
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between"><Label>Rastrear Atividade</Label><Switch checked={formData.activity_tracking} onCheckedChange={(v) => setFormData({ ...formData, activity_tracking: v })} /></div>
              <div className="flex items-center justify-between"><Label>Rastrear Aplicativos</Label><Switch checked={formData.app_tracking} onCheckedChange={(v) => setFormData({ ...formData, app_tracking: v })} /></div>
              <div className="flex items-center justify-between"><Label>Rastrear URLs</Label><Switch checked={formData.url_tracking} onCheckedChange={(v) => setFormData({ ...formData, url_tracking: v })} /></div>
              <div className="flex items-center justify-between"><Label>Rastrear Teclas</Label><Switch checked={formData.keystroke_tracking} onCheckedChange={(v) => setFormData({ ...formData, keystroke_tracking: v })} /></div>
              <div className="flex items-center justify-between"><Label>Rastrear Localizacao</Label><Switch checked={formData.location_tracking} onCheckedChange={(v) => setFormData({ ...formData, location_tracking: v })} /></div>
              <div className="flex items-center justify-between"><Label>Detectar Ociosidade</Label><Switch checked={formData.idle_detection} onCheckedChange={(v) => setFormData({ ...formData, idle_detection: v })} /></div>
              <div className="flex items-center justify-between"><Label>Apenas Horario Comercial</Label><Switch checked={formData.work_hours_only} onCheckedChange={(v) => setFormData({ ...formData, work_hours_only: v })} /></div>
              <div className="flex items-center justify-between"><Label>Politica Ativa</Label><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>{(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingPolicy ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Excluir Politica" description={`Excluir "${deletingPolicy?.name}"?`} onConfirm={handleDelete} isLoading={isDeleting} variant="destructive" />
    </div>
  );
}
