import { MapPin, Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useGeofencingPage } from '@/hooks/useGeofencingPage';

export default function GeofencingPage() {
  const {
    selectedGeofence, setSelectedGeofence,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingGeofence, formData, setFormData,
    geofences, stats, isLoading,
    isCreating, isUpdating, isDeleting,
    handleOpenCreate, handleOpenEdit, handleCloseDialog, handleSubmit, handleDelete,
  } = useGeofencingPage();

  if (isLoading) {
    return <div className="p-6 space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}</div></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="h-6 w-6 text-primary" />Geofencing</h1>
          <p className="text-muted-foreground mt-1">Configure cercas geográficas e áreas monitoradas</p>
        </div>
        <Button onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" />Nova Geofence</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.active}</p><p className="text-xs text-muted-foreground">Ativas</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.restricted}</p><p className="text-xs text-muted-foreground">Restritas</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-blue-600">{stats.required}</p><p className="text-xs text-muted-foreground">Obrigatórias</p></CardContent></Card>
      </div>

      {/* Geofences Grid */}
      {geofences.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma geofence configurada.</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {geofences.map(geo => (
            <Card key={geo.id} className={`cursor-pointer transition-shadow hover:shadow-md ${selectedGeofence?.id === geo.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedGeofence(geo)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: geo.color }} />
                    {geo.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); handleOpenEdit(geo); }}><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); setSelectedGeofence(geo); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{geo.description || 'Sem descrição'}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={geo.is_active ? 'default' : 'secondary'}>{geo.is_active ? 'Ativa' : 'Inativa'}</Badge>
                  <Badge variant="outline"><Users className="h-3 w-3 mr-1" />{geo.employees_count || 0}</Badge>
                  <Badge variant="outline">{geo.radius}m</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">📍 {geo.center_lat?.toFixed(4)}, {geo.center_lng?.toFixed(4)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingGeofence ? 'Editar Geofence' : 'Nova Geofence'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Escritório Central" /></div>
            <div><Label>Descrição</Label><Input value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descrição opcional" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Latitude</Label><Input type="number" step="0.0001" value={formData.center_lat} onChange={e => setFormData(prev => ({ ...prev, center_lat: parseFloat(e.target.value) }))} /></div>
              <div><Label>Longitude</Label><Input type="number" step="0.0001" value={formData.center_lng} onChange={e => setFormData(prev => ({ ...prev, center_lng: parseFloat(e.target.value) }))} /></div>
            </div>
            <div><Label>Raio (metros)</Label><Input type="number" value={formData.radius} onChange={e => setFormData(prev => ({ ...prev, radius: parseInt(e.target.value) }))} /></div>
            <div className="flex items-center justify-between"><Label>Ativa</Label><Switch checked={formData.is_active} onCheckedChange={v => setFormData(prev => ({ ...prev, is_active: v }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating || !formData.name}>
              {isCreating || isUpdating ? 'Salvando...' : editingGeofence ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Geofence?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. A geofence "{selectedGeofence?.name}" será removida permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Excluir'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { GeofencingPage };
